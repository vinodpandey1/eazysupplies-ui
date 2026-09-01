"use client";

import BrandBadge from "@/components/widgets/BrandBadge";
import { BASE_URL } from "@/utils/axiosUtils/API";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== "";

const formatINR = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return null;

  return `₹${numericAmount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

const ProductInformation = ({ productState }) => {
  const { t } = useTranslation("common");
  const product = productState?.product;
  const [taxes, setTaxes] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadTaxes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/tax`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        setTaxes(Array.isArray(payload) ? payload : payload?.data || []);
      } catch (error) {
        if (error?.name !== "AbortError") setTaxes([]);
      }
    };

    loadTaxes();
    return () => controller.abort();
  }, []);

  const category = product?.category || product?.categories?.[0] || null;
  const brand = product?.brand || null;
  const tax = useMemo(() => {
    if (product?.tax && typeof product.tax === "object") return product.tax;
    return taxes.find((item) => Number(item?.id) === Number(product?.tax)) || null;
  }, [product?.tax, taxes]);

  const taxLabel = tax
    ? `${tax?.name || "GST"}${hasValue(tax?.value) ? ` (${tax.value}%)` : ""}`
    : null;

  const details = [
    { label: t("Packaging"), value: product?.dimension },
    { label: t("Category"), value: category?.name },
    { label: t("SKU"), value: product?.sku },
    { label: t("selflife"), value: hasValue(product?.selfLife) ? `${product.selfLife} ${t("Month")}` : null },
    { label: t("Tax"), value: taxLabel },
    { label: t("Unit Rate"), value: formatINR(product?.unitRate) },
  ].filter((item) => hasValue(item.value));

  if (!product || !details.length) return null;

  return (
    <section className="bordered-box product-specifications" aria-labelledby="product-information-title">
      <div className="product-specifications__heading">
        <h4 id="product-information-title" className="sub-title">
          {t("ProductInformation")}
        </h4>
        {brand && <BrandBadge brand={brand} />}
      </div>
      <dl className="product-specifications__list">
        {details.map((detail) => (
          <div className="product-specifications__item" key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ProductInformation;
