import { useEffect, useState } from "react";
import { loadHomepageProjects } from "./catalog.js";

export default function useProjectCatalog() {
  const [catalog, setCatalog] = useState({status:"loading", projects:[]});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCatalog({status:"loading", projects:[]});
    loadHomepageProjects({apiBase:(import.meta.env.VITE_API_BASE || "").replace(/\/$/, ""), signal:controller.signal})
      .then(projects => { if (!controller.signal.aborted) setCatalog({status:projects.length ? "ready" : "empty", projects}); })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error("[project-catalog]", error.message);
        setCatalog({status:"error", projects:[]});
      });
    return () => controller.abort();
  }, [attempt]);
  return {...catalog, retry:() => setAttempt(value => value + 1)};
}
