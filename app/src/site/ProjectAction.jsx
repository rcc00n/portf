import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./project-action.css";

/** A quiet edge action between the opening and the page's own contact action. */
export default function ProjectAction() {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(null);
  useEffect(() => {
    if (pathname.startsWith("/start") || ["/privacy", "/terms", "/systems/demo"].includes(pathname)) return;
    const wide = window.matchMedia("(min-width: 1280px)");
    let opening;
    let passedOpening = false;
    const visibleEndings = new Set();
    const sync = () => setActivePath(wide.matches && passedOpening && !visibleEndings.size ? pathname : null);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === opening) passedOpening = !entry.isIntersecting && entry.boundingClientRect.bottom <= 80;
        else if (entry.isIntersecting) visibleEndings.add(entry.target);
        else visibleEndings.delete(entry.target);
      }
      sync();
    }, { rootMargin: "-80px 0px 0px", threshold: 0 });
    // Secondary route chunks and CMS case leads can arrive after the shell.
    const connect = () => {
      opening = document.querySelector(".hp-hero, .site-lead");
      const endings = [...document.querySelectorAll(".hp-start, .site-closing, .site-footer")];
      if (!opening || !endings.length) return;
      observer.observe(opening);
      endings.forEach(node => observer.observe(node));
      changes.disconnect();
    };
    const changes = new MutationObserver(connect);
    changes.observe(document.body, { childList: true, subtree: true });
    connect();
    wide.addEventListener("change", sync);
    return () => { observer.disconnect(); changes.disconnect(); wide.removeEventListener("change", sync); };
  }, [pathname]);
  if (activePath !== pathname) return null;
  return <Link className="project-action" to="/start"><span>Start a project</span><b aria-hidden="true">↗</b></Link>;
}
