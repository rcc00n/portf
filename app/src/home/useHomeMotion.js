import { useEffect, useRef } from "react";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const phase = (value, start, end) => clamp((value - start) / Math.max(end - start, 0.001));

export default function useHomeMotion(rootRef) {
  const entranceRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const hero = root.querySelector(".hp-hero");
    const stage = root.querySelector(".hp-hero-plane");
    const acts = [...root.querySelectorAll("[data-home-act]")];
    const evidence = [...root.querySelectorAll("[data-home-evidence]")];
    const layers = [...root.querySelectorAll(".hp-flagship__architecture span")];
    const decisions = [...root.querySelectorAll("[data-decision-step]")];
    const decisionList = root.querySelector(".hp-approach-list");
    const heroAction = hero?.querySelector(".hp-hero-enter");
    const navLinks = [...root.querySelectorAll('.hp-nav a[href^="#"]')];
    if (!hero || !stage || !acts.length) return undefined;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const visibleActs = new Set();
    let ambientTimer = 0;
    let ambientClearTimer = 0;
    let scrollFrame = 0;
    document.documentElement.classList.add("raccn-home-active");
    if (entranceRef.current === null) {
      try {
        entranceRef.current = window.sessionStorage.getItem("raccn-home-seen") === "1" ? "returning" : "first";
        window.sessionStorage.setItem("raccn-home-seen", "1");
      } catch { entranceRef.current = "first"; }
    }
    root.dataset.entrance = entranceRef.current;
    // One finite ambient event at a time, scoped to the visible active section.
    const canRunAmbient = () => visibleActs.has(root.dataset.currentAct)
      && document.visibilityState === "visible" && !reducedQuery.matches && !coarseQuery.matches;
    const stopAmbient = () => {
      window.clearTimeout(ambientTimer);
      window.clearTimeout(ambientClearTimer);
      ambientTimer = 0;
      ambientClearTimer = 0;
      root.classList.remove("is-signal-passing");
    };
    const scheduleAmbient = () => {
      if (!canRunAmbient() || ambientTimer || ambientClearTimer) return;
      ambientTimer = window.setTimeout(() => {
        ambientTimer = 0;
        if (!canRunAmbient()) return;
        root.classList.add("is-signal-passing");
        ambientClearTimer = window.setTimeout(() => {
          ambientClearTimer = 0;
          root.classList.remove("is-signal-passing");
          scheduleAmbient();
        }, 1650);
      }, 4200);
    };
    const setProgress = (element, name, value, unit = "") => {
      const next = `${value.toFixed(3)}${unit}`;
      if (element.style.getPropertyValue(name) !== next) element.style.setProperty(name, next);
    };
    const applyRoute = (route) => {
      if (root.dataset.route !== route) root.dataset.route = route;
    };
    const applyAct = (act) => {
      if (root.dataset.currentAct === act) return;
      root.dataset.currentAct = act;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${act}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      stopAmbient();
      scheduleAmbient();
    };
    const updateScroll = () => {
      const viewport = window.innerHeight;
      const reduced = reducedQuery.matches;
      // Read geometry together before writing authored states. No idle RAF loop.
      const actRects = acts.map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const mediaRects = evidence.map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const layerRects = layers.map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const decisionRects = decisions.map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const listRect = decisionList?.getBoundingClientRect();
      const heroRect = actRects[0].rect;
      const heroProgress = clamp(-heroRect.top / Math.max(heroRect.height, 1));
      setProgress(root, "--hp-hero-progress", reduced ? (heroProgress > .56 ? 1 : 0) : heroProgress);
      setProgress(root, "--hp-hero-expose", reduced ? (heroProgress > .12 ? 1 : 0) : phase(heroProgress, 0, .17));
      setProgress(root, "--hp-hero-route", reduced ? (heroProgress > .22 ? 1 : 0) : phase(heroProgress, .07, .26));
      setProgress(root, "--hp-hero-resolve", reduced ? (heroProgress > .36 ? 1 : 0) : phase(heroProgress, .25, .44));
      setProgress(root, "--hp-hero-handoff", reduced ? (heroProgress > .56 ? 1 : 0) : phase(heroProgress, .40, .64));
      const heroState = heroProgress >= .56 ? "handoff" : heroProgress >= .36 ? "resolved"
        : heroProgress >= .19 ? "routing" : heroProgress >= .025 ? "exposed" : "assembled";
      if (root.dataset.heroState !== heroState) root.dataset.heroState = heroState;
      if (heroAction) heroAction.inert = heroState === "handoff";
      applyRoute(heroProgress >= .42 ? "audit" : heroProgress >= .19 ? "output" : heroProgress >= .055 ? "policy" : "input");
      let currentAct = "hero";
      actRects.forEach(({ element, rect }) => {
        const progress = clamp((viewport - rect.top) / Math.max(rect.height + viewport, 1));
        const entry = phase((viewport - rect.top) / viewport, .08, .72);
        const exit = phase((viewport - rect.bottom) / viewport, 0, .7);
        if (element !== hero) setProgress(root, `--hp-${element.dataset.homeAct}-progress`, reduced ? (progress > .48 ? 1 : 0) : progress);
        setProgress(element, "--hp-section-enter", reduced ? 1 : entry);
        setProgress(element, "--hp-section-exit", reduced ? 1 : exit);
        if (rect.top <= viewport * .52 && rect.bottom > viewport * .2) currentAct = element.dataset.homeAct;
      });
      mediaRects.forEach(({ element, rect }) => {
        setProgress(element, "--evidence-progress", reduced ? 1 : phase((viewport - rect.top) / Math.min(viewport, rect.height + viewport * .35), .04, .82));
      });
      layerRects.forEach(({ element, rect }) => {
        setProgress(element, "--layer-progress", reduced ? 1 : phase((viewport - rect.top) / viewport, .12, .55));
      });
      if (decisionRects.length && listRect) {
        const first = decisionRects[0].rect;
        const last = decisionRects.at(-1).rect;
        const firstCenter = first.top + first.height / 2;
        const lastCenter = last.top + last.height / 2;
        setProgress(decisionList, "--decision-first", firstCenter - listRect.top, "px");
        setProgress(decisionList, "--decision-last", listRect.bottom - lastCenter, "px");
        const progress = clamp((viewport * .64 - firstCenter) / Math.max(1,lastCenter - firstCenter));
        setProgress(decisionList, "--decision-progress", reduced ? Math.round(progress * 3) / 3 : progress);
        decisionRects.forEach(({ element, rect }) => {
          const center = rect.top + rect.height / 2;
          const reached = center <= viewport * .64;
          const state = reached ? "reached" : "pending";
          if (element.dataset.state !== state) element.dataset.state = state;
          setProgress(element, "--decision-state", reduced ? Number(reached) : phase((viewport - center) / viewport, .24, .36));
        });
      }
      applyAct(currentAct);
    };
    const scheduleScroll = () => {
      if (scrollFrame || document.visibilityState !== "visible") return;
      scrollFrame = window.requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
    };
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        target.dataset.inView = String(isIntersecting);
        if (isIntersecting) target.dataset.seen = "true";
        const act = target.dataset.homeAct;
        if (!act) return;
        if (isIntersecting) visibleActs.add(act);
        else visibleActs.delete(act);
        if (target === hero) {
          root.classList.toggle("is-hero-visible", isIntersecting);
          const control = stage.querySelector('[role="button"]');
          if (control) control.tabIndex = isIntersecting ? 0 : -1;
        }
      });
      if (canRunAmbient()) scheduleAmbient();
      else stopAmbient();
    }, { rootMargin: "60px" });
    const resizeObserver = new ResizeObserver(scheduleScroll);
    const updateMotionPreference = () => {
      stopAmbient();
      root.dataset.motion = reducedQuery.matches ? "reduced" : coarseQuery.matches ? "touch" : "full";
      updateScroll();
      scheduleAmbient();
    };
    const onVisibilityChange = () => {
      root.classList.toggle("is-document-hidden", document.visibilityState !== "visible");
      if (document.visibilityState === "visible") { scheduleScroll(); scheduleAmbient(); }
      else { stopAmbient(); window.cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
    };
    [...acts, ...evidence].forEach((element) => visibilityObserver.observe(element));
    acts.forEach((element) => resizeObserver.observe(element));
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.addEventListener("change", updateMotionPreference);
    coarseQuery.addEventListener("change", updateMotionPreference);
    onVisibilityChange();
    updateMotionPreference();
    return () => {
      stopAmbient();
      window.cancelAnimationFrame(scrollFrame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedQuery.removeEventListener("change", updateMotionPreference);
      coarseQuery.removeEventListener("change", updateMotionPreference);
      document.documentElement.classList.remove("raccn-home-active");
    };
  }, [rootRef]);
}
