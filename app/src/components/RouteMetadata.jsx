import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getMetaForPath } from "../utils/seo.js";

const origin = "https://raccncode.com";
const setMeta = (attribute, name, value) => {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = value;
};

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const meta = getMetaForPath(path);
    const canonicalUrl = `${origin}${path}`;
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noindex || path.startsWith("/prototype") ? "noindex, follow" : "index, follow");
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", `${origin}${meta.image}`);
    setMeta("property", "og:image:alt", "RACCN Code — Digital systems made visible");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", `${origin}${meta.image}`);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
  }, [pathname]);
  return null;
}
