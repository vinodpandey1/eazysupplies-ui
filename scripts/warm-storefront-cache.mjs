#!/usr/bin/env node

const storefrontUrl = new URL(process.env.STOREFRONT_URL || "https://eazysupplies.com");
const apiUrl = new URL(process.env.API_URL || "https://api.eazysupplies.com");
const concurrency = positiveInteger(process.env.WARM_CONCURRENCY, 6);
const timeoutMs = positiveInteger(process.env.WARM_TIMEOUT_MS, 20_000);
const passes = positiveInteger(process.env.WARM_PASSES, 2);

const staticPaths = [
  "/",
  "/collections?layout=collection_4_grid",
  "/about-us",
  "/contact-us",
  "/faq",
];

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchJson(path) {
  const response = await fetch(new URL(path, apiUrl), {
    headers: { Accept: "application/json", "User-Agent": "EazySupplies-CacheWarmer/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${response.url}`);
  }

  return response.json();
}

function records(payload) {
  return Array.isArray(payload?.data) ? payload.data : [];
}

function collectionPath(filter, item) {
  const params = new URLSearchParams({
    layout: "collection_4_grid",
    [filter]: String(item.id),
    title: item.name,
  });
  return `/collections?${params.toString()}`;
}

async function discoverPaths() {
  const [categoryPayload, brandPayload, productPayload] = await Promise.all([
    fetchJson("/api/categories?status=1&paginate=1000"),
    fetchJson("/api/brands?status=1&paginate=1000"),
    fetchJson("/api/products?status=1&paginate=1000"),
  ]);

  const categories = records(categoryPayload);
  const brands = records(brandPayload);
  const products = records(productPayload);

  return [...new Set([
    ...staticPaths,
    ...categories.filter((item) => item?.id && item?.name).map((item) => collectionPath("category", item)),
    ...brands.filter((item) => item?.id && item?.name).map((item) => collectionPath("brand", item)),
    ...products
      .filter((item) => item?.slug || item?.id)
      .map((item) => `/product/${encodeURIComponent(item.slug || item.id)}`),
  ])];
}

async function warm(path, pass) {
  const url = new URL(path, storefrontUrl);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip, br",
        "User-Agent": "EazySupplies-CacheWarmer/1.0",
        "X-Cache-Warmup": "1",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    await response.arrayBuffer();

    return {
      path,
      pass,
      ok: response.ok,
      status: response.status,
      cache: response.headers.get("x-storefront-cache") || "NONE",
      milliseconds: Date.now() - startedAt,
    };
  } catch (error) {
    return { path, pass, ok: false, status: 0, cache: "ERROR", milliseconds: Date.now() - startedAt, error: error.message };
  }
}

async function mapLimited(items, limit, callback) {
  const output = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await callback(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

async function main() {
  const paths = await discoverPaths();
  console.log(`Discovered ${paths.length} public storefront URLs.`);

  let failed = false;
  for (let pass = 1; pass <= passes; pass += 1) {
    const results = await mapLimited(paths, concurrency, (path) => warm(path, pass));
    const counts = results.reduce((summary, result) => {
      summary[result.cache] = (summary[result.cache] || 0) + 1;
      if (!result.ok) failed = true;
      return summary;
    }, {});
    const timings = results.map((result) => result.milliseconds).sort((a, b) => a - b);
    const p95 = timings[Math.min(timings.length - 1, Math.floor(timings.length * 0.95))] || 0;

    for (const result of results.filter((item) => !item.ok)) {
      console.error(`FAIL ${result.status || "ERR"} ${result.path}${result.error ? ` - ${result.error}` : ""}`);
    }
    console.log(`Pass ${pass}: ${JSON.stringify(counts)}, p95=${p95}ms`);
  }

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Cache warm-up aborted: ${error.message}`);
  process.exitCode = 1;
});
