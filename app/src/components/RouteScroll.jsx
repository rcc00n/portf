import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Mount inside each route's Suspense boundary so positioning happens when the
// destination has actually rendered, including the separately rendered homepage.
export default function RouteScroll({ children }) {
  const { pathname, hash, key } = useLocation();

  useLayoutEffect(() => {
    // Back/forward navigation follows the same top-of-page rule as normal links.
    // Native document anchors keep their existing section-specific positioning.
    window.history.scrollRestoration = "manual";
    if (hash) return;

    const top = () => window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    top();
    const frame = window.requestAnimationFrame(top);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return children;
}
