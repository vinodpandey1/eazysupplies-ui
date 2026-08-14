# Storefront page cache

This cache is deliberately limited to cookie-free public HTML requests. Authentication, account, cart, checkout, order, payment, wishlist, compare, API, React Server Component, non-GET, and cookie-bearing requests bypass it.

Install `storefront-cache.conf` in `/etc/nginx/conf.d/`, add the `connection_upgrade` map if it is not already defined, and replace the storefront server's `location /` with `eazysupplies-location.conf`. Always run `sudo nginx -t` before reloading.

After a deployment, warm the cache from the active release directory:

```sh
npm run cache:warm
```

The warmer discovers active categories, brands, and products from the API, makes two passes over public URLs, and reports Nginx `MISS`/`HIT` status and p95 response time. Override behavior with `STOREFRONT_URL`, `API_URL`, `WARM_CONCURRENCY`, `WARM_TIMEOUT_MS`, and `WARM_PASSES`.

Do not add private pages to the warmer or relax the cookie/private-path bypass rules.
