"use client";

import OptimizedImage from "@/components/widgets/OptimizedImage";
import ProductBox from "@/components/widgets/productBox";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import request from "@/utils/axiosUtils";
import { CategoryAPI, ProductAPI } from "@/utils/axiosUtils/API";
import useCustomDataQuery from "@/utils/hooks/useCustomDataQuery";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Container } from "reactstrap";
import HomeSlider from "../widgets/HomeSlider";

export const EARTHLING_HOME_DEFAULTS = {
  hero: {
    slides: [
      { image: "/assets/images/earthling-home/hero-1.jpg", alt: "Royal Grove canned foods" },
      { image: "/assets/images/earthling-home/hero-2.jpeg", alt: "Earthling food collection" },
      { image: "/assets/images/earthling-home/hero-3.webp", alt: "Earthling pantry essentials" },
    ],
  },
  story: {
    eyebrow: "Earthling Consumer Products",
    title: "Why choose us",
    body: "At Earthling, we believe everyday meals should feel effortless, dependable and full of flavour. Our carefully selected range of canned fruits, vegetables, sauces, syrups, purees and ready-to-use ingredients helps homes and professional kitchens create memorable food with confidence.",
    body_secondary: "Every product reflects our focus on integrity, quality and passion—from sourcing and packaging to the moment it reaches your kitchen.",
    image: "/assets/images/earthling-home/story.jpg",
    button_text: "Explore all products",
    button_url: "/collections",
  },
  stats: [
    { value: "100+", label: "SKUs" },
    { value: "25+", label: "Lakh cans sold" },
    { value: "40+", label: "Cities" },
    { value: "10k+", label: "Happy customers" },
  ],
  media: {
    title: "Experience delicious flavours",
    subtitle: "Stories from chefs, partners and the Earthling community.",
    cards: [],
  },
  expert: {
    title: "Expert corner",
    image: "/assets/images/earthling-home/expert.jpg",
    quote: "Quality ingredients make good cooking simpler. Earthling brings dependable products and consistent flavour to every kitchen.",
    name: "Chef Izzat Hussain",
    role: "Culinary expert",
  },
  featured: { title: "Popular products", product_ids: [] },
  categories: { title: "Shop by category", category_ids: [] },
};

const mergeConfig = (stored = {}) => ({
  ...EARTHLING_HOME_DEFAULTS,
  ...stored,
  hero: { ...EARTHLING_HOME_DEFAULTS.hero, ...stored.hero },
  story: { ...EARTHLING_HOME_DEFAULTS.story, ...stored.story },
  media: { ...EARTHLING_HOME_DEFAULTS.media, ...stored.media },
  expert: { ...EARTHLING_HOME_DEFAULTS.expert, ...stored.expert },
  featured: { ...EARTHLING_HOME_DEFAULTS.featured, ...stored.featured },
  categories: { ...EARTHLING_HOME_DEFAULTS.categories, ...stored.categories },
});

const EarthlingHome = () => {
  const { data: homeData, refetch } = useCustomDataQuery({ params: "earthling_home" });
  const config = useMemo(() => mergeConfig(homeData?.earthling_home), [homeData]);
  const classicLatest = useMemo(() => homeData?.products_list || {}, [homeData?.products_list]);

  const { data: products = [] } = useFetchQuery(
    ["earthling-home-products", config.featured.product_ids],
    () => request({ url: ProductAPI, params: { status: 1, paginate: 100 } }),
    { refetchOnWindowFocus: false, select: (response) => response?.data?.data || [] },
  );

  const { data: categories = [] } = useFetchQuery(
    ["earthling-home-categories", config.categories.category_ids],
    () => request({ url: CategoryAPI, params: { status: 1 } }),
    { refetchOnWindowFocus: false, select: (response) => response?.data?.data || response?.data || [] },
  );

  useEffect(() => { refetch(); }, [refetch]);

  const selectedProducts = useMemo(() => {
    const selectedIds = (config.featured.product_ids || []).map(Number);
    const source = selectedIds.length ? products.filter((product) => selectedIds.includes(Number(product.id))) : products;
    return source.slice(0, 8);
  }, [config.featured.product_ids, products]);

  const selectedCategories = useMemo(() => {
    return categories.filter((category) => category?.status !== 0);
  }, [categories]);

  const latestProducts = useMemo(() => {
    const uniqueProducts = products.filter((product, index, source) => source.findIndex((item) => Number(item.id) === Number(product.id)) === index);
    return uniqueProducts
      .sort((first, second) => {
        const firstCreated = Date.parse(first.created_at || first.createdAt || "") || Number(first.id) || 0;
        const secondCreated = Date.parse(second.created_at || second.createdAt || "") || Number(second.id) || 0;
        return secondCreated - firstCreated;
      })
      .slice(0, 4);
  }, [products]);

  return (
    <main className="earthling-homepage">
      <WrapperComponent classes={{ sectionClass: "p-0 overflow-hidden position-relative", fluidClass: "slide-1 home-slider" }}>
        <HomeSlider bannerData={homeData?.home_banner} height={650} width={1920} />
      </WrapperComponent>

      <Container>
        {classicLatest.status !== false && latestProducts.length > 0 && <section className="earthling-latest earthling-latest--after-hero">
          <header>
            <span>{classicLatest.tag || "Special Offer"}</span>
            <h2>{classicLatest.title && classicLatest.title !== "Latest Drops" ? classicLatest.title : "Latest Eats"}</h2>
            {classicLatest.description && <p>{classicLatest.description}</p>}
          </header>
          <div className="earthling-featured__grid">{latestProducts.map((product) => <ProductBox key={`latest-${product.id}`} product={product} style="vertical" variantOverride="product_box_two" />)}</div>
        </section>}

        <section className="earthling-story">
          <div className="earthling-story__media"><OptimizedImage src={config.story.image} alt={config.story.title} loading="lazy" /></div>
          <div className="earthling-story__content">
            <span>{config.story.eyebrow}</span><h1>{config.story.title}</h1><p>{config.story.body}</p><p>{config.story.body_secondary}</p>
            <Link href={config.story.button_url || "/collections"} className="earthling-home-btn">{config.story.button_text || "Explore products"}</Link>
          </div>
        </section>

        <section className="earthling-stats" aria-label="Earthling at a glance">
          {(config.stats || []).map((stat, index) => <div key={`${stat.label}-${index}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </section>
      </Container>

      {(config.media.cards || []).length > 0 && <section className="earthling-media"><Container><header><h2>{config.media.title}</h2><p>{config.media.subtitle}</p></header><div className="earthling-media__grid">{config.media.cards.map((card, index) => <a key={`${card.title}-${index}`} href={card.url || "#"} target={card.url?.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><OptimizedImage src={card.poster || config.story.image} alt={card.title} loading="lazy" /><span>{card.title}</span></a>)}</div></Container></section>}

      <Container>
        <section className="earthling-expert"><header><h2>{config.expert.title}</h2></header><div className="earthling-expert__grid"><OptimizedImage src={config.expert.image} alt={config.expert.name} loading="lazy" /><blockquote><p>“{config.expert.quote}”</p><strong>{config.expert.name}</strong><span>{config.expert.role}</span></blockquote></div></section>

        {selectedProducts.length > 0 && <section className="earthling-featured"><header><h2>{config.featured.title}</h2><Link href="/collections">View all</Link></header><div className="earthling-featured__grid">{selectedProducts.map((product) => <ProductBox key={product.id} product={product} style="vertical" variantOverride="product_box_two" />)}</div></section>}

        {selectedCategories.length > 0 && <section className="earthling-categories"><header><span>All Categories</span><h2>{config.categories.title}</h2></header><div className="earthling-categories__grid">{selectedCategories.map((category) => {
          const isDefaultCategory = String(category.name || "").trim().toLowerCase() === "default";
          const categoryName = isDefaultCategory ? "All Categories" : category.name;
          const categoryUrl = isDefaultCategory
            ? "/collections?layout=collection_3_grid"
            : `/collections?layout=collection_3_grid&category=${category.id}&title=${encodeURIComponent(category.name)}`;
          return <Link key={category.id} href={categoryUrl}><span>{categoryName}</span><small>Explore collection</small></Link>;
        })}</div></section>}
      </Container>
    </main>
  );
};

export default EarthlingHome;
