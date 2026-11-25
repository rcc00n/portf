import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyMetadata, getMetaForPath, normalizePath, ROUTE_META } from "../utils/seo.js";

export default function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = normalizePath(pathname);
    // Keep authoritative server case metadata until the case's existing catalog
    // request resolves. Client navigation starts conservatively, without a case claim.
    if (ROUTE_META[path]?.caseSlug && document.querySelector('meta[name="raccn:route"]')?.content === path) return;
    applyMetadata(getMetaForPath(path));
  }, [pathname]);
  return null;
}
