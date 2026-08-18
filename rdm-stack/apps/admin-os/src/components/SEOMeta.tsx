import { useEffect } from "react";

interface SEOMetaProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export const SEOMeta = ({ title, description, canonical, noindex, image, jsonLd }: SEOMetaProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta('meta[property="og:title"]', "property", "og:title", title);
      upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    }
    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[property="og:description"]', "property", "og:description", description);
      upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }
    upsertMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    if (image) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", image);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
    }
    if (canonical) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
      let l = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!l) {
        l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        document.head.appendChild(l);
      }
      l.setAttribute("href", canonical);
    }
  }, [title, description, canonical, noindex, image]);

  useEffect(() => {
    if (!jsonLd) return;
    const id = "rdm-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [jsonLd]);

  return null;
};

export default SEOMeta;
