"use client";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { useContext } from "react";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import Loader from "@/layout/loader";
import CustomText from "./customText";
import { useState, useEffect } from 'react';
import { prodapiurl } from "@/utils/constants";
import { useSearchParams } from 'next/navigation';

const policyAnchors = {
  "website policy": "website-policy",
  "website policies": "website-policy",
  "return policy": "return-policy",
  "replacement policy": "replacement-policy",
  "refund policy": "refund-policy",
  "shipping policy": "shipping-policy",
};

const addPolicyAnchors = (html) =>
  html.replace(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi, (heading, tag, attributes, content) => {
    const headingText = content.replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|amp);/gi, (value) => value.toLowerCase() === "&amp;" ? "&" : " ").replace(/\s+/g, " ").trim().toLowerCase();
    const anchor = policyAnchors[headingText];
    if (!anchor) return heading;

    const cleanAttributes = attributes.replace(/\s+id=(?:"[^"]*"|'[^']*'|[^\s>]*)/i, "");
    return `<${tag}${cleanAttributes} id="${anchor}">${content}</${tag}>`;
  });

const CustomContent = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const pageid = searchParams.get('name');
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch(prodapiurl+'/template?name='+pageid, { cache: "no-store" });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || typeof data.htmlData !== "string" || !data.htmlData.trim()) {
          throw new Error("This page is not available yet. Please contact support for assistance.");
        }

        setHtmlContent(pageid === "website-policy" ? addPolicyAnchors(data.htmlData) : data.htmlData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load policy');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, [pageid]);

  useEffect(() => {
    if (!htmlContent || typeof window === "undefined" || !window.location.hash) return;

    const anchor = decodeURIComponent(window.location.hash.slice(1));
    const scrollToSection = () => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const frame = window.requestAnimationFrame(scrollToSection);
    return () => window.cancelAnimationFrame(frame);
  }, [htmlContent]);

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <WrapperComponent classes={{ sectionClass: "about-page section-b-space", fluidClass: "container" }} noRowCol={true}>
        <div className="policy-document policy-document--error" role="alert">{error}</div>
      </WrapperComponent>
    );
  }
  return (
    <>
      {/* <Breadcrumbs title={pageid} subNavigation={[{ name: pageid }]} /> */}
      <WrapperComponent
        classes={{
          sectionClass: "about-page section-b-space ",
          fluidClass: "container",
        }}
        noRowCol={true}
      >
          <CustomText data={htmlContent}/>
      </WrapperComponent>
    </>
  );
};

export default CustomContent;
