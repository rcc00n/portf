import { useEffect } from "react";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from, to, progress) => from + (to - from) * progress;

export default function useControlPlaneMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.querySelector(".tp-plates-hero");
    const stage = root?.querySelector(".tp-plates-stage");
    if (!root || !hero || !stage) return undefined;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const state = {
      pointerX: 0,
      pointerY: 0,
      targetX: 0,
      targetY: 0,
      proximity: 0,
      targetProximity: 0,
      progress: 0,
      visible: true,
      appliedProgress: -1,
      motionMode: "",
    };
    let frame = 0;
    let timer = 0;

    try {
      const returning = window.sessionStorage.getItem("raccn-control-plane-seen") === "1";
      root.dataset.entrance = returning ? "returning" : "first";
      window.sessionStorage.setItem("raccn-control-plane-seen", "1");
    } catch {
      root.dataset.entrance = "first";
    }

    const shouldAmbient = () => (
      state.visible
      && document.visibilityState === "visible"
      && !reducedQuery.matches
      && !coarseQuery.matches
    );

    const setMotionProperties = (time = 0) => {
      frame = 0;
      timer = 0;

      state.pointerX = mix(state.pointerX, state.targetX, 0.12);
      state.pointerY = mix(state.pointerY, state.targetY, 0.12);
      state.proximity = mix(state.proximity, state.targetProximity, 0.14);

      const ambient = shouldAmbient() ? Math.sin(time / 3600) : 0;
      const counterAmbient = shouldAmbient() ? Math.sin(time / 4700 + 1.7) : 0;
      const progress = reducedQuery.matches ? (state.progress >= 0.72 ? 1 : 0) : state.progress;
      const handoff = clamp((progress - 0.46) / 0.46);
      const evidence = clamp((progress - 0.66) / 0.34);
      const heroHeight = hero.getBoundingClientRect().height;

      root.style.setProperty("--cp-stage-x", `${state.pointerX * 8}px`);
      root.style.setProperty("--cp-stage-y", `${state.pointerY * 5 + progress * heroHeight * 0.13}px`);
      root.style.setProperty("--cp-back-y", `${ambient * -2.5 - progress * 110}px`);
      root.style.setProperty("--cp-middle-y", `${counterAmbient * 1.8 - progress * 52}px`);
      root.style.setProperty("--cp-front-x", `${state.pointerX * -2.5 - state.proximity * 4}px`);
      root.style.setProperty("--cp-front-y", `${ambient * 1.2 + progress * 9 - state.proximity * 6}px`);
      root.style.setProperty("--cp-signal-offset", `${-((time / 18) % 920)}`);

      if (progress !== state.appliedProgress) {
        root.style.setProperty("--cp-progress", progress.toFixed(4));
        root.style.setProperty("--cp-handoff", handoff.toFixed(4));
        root.style.setProperty("--cp-evidence", evidence.toFixed(4));
        root.style.setProperty("--cp-stage-scale", `${1 - progress * 0.075}`);
        root.style.setProperty("--cp-back-opacity", `${1 - handoff * 0.9}`);
        root.style.setProperty("--cp-middle-opacity", `${1 - handoff * 0.66}`);
        root.style.setProperty("--cp-evidence-shift", `${(1 - evidence) * 32}px`);
        root.style.setProperty("--cp-evidence-opacity", `${0.72 + evidence * 0.28}`);
        root.style.setProperty(
          "--cp-market-clip",
          `polygon(${15 - evidence * 8}% 0, 100% 0, ${85 + evidence * 8}% 100%, 0 100%)`,
        );
        root.style.setProperty(
          "--cp-control-clip",
          `polygon(0 0, ${84 + evidence * 7}% 0, 100% 100%, ${16 - evidence * 7}% 100%)`,
        );
        state.appliedProgress = progress;
      }

      const motionMode = reducedQuery.matches ? "reduced" : "active";
      if (motionMode !== state.motionMode) {
        root.dataset.motion = motionMode;
        state.motionMode = motionMode;
      }

      if (shouldAmbient()) {
        timer = window.setTimeout(() => {
          frame = window.requestAnimationFrame(setMotionProperties);
        }, 50);
      }
    };

    const schedule = (immediate = false) => {
      if (immediate && timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
      if (!frame && !timer) frame = window.requestAnimationFrame(setMotionProperties);
    };

    const updateScroll = () => {
      const rect = hero.getBoundingClientRect();
      state.progress = clamp(-rect.top / Math.max(rect.height * 0.92, 1));
      schedule(true);
    };

    const updatePointer = (event) => {
      if (coarseQuery.matches || reducedQuery.matches) return;
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width / 2, 1);
      const y = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height / 2, 1);
      const distance = Math.hypot(x * 0.85, y);
      state.targetX = clamp(x, -1, 1);
      state.targetY = clamp(y, -1, 1);
      state.targetProximity = clamp(1 - distance / 1.05);
      schedule(true);
    };

    const resetPointer = () => {
      state.targetX = 0;
      state.targetY = 0;
      state.targetProximity = 0;
      schedule(true);
    };

    const updateMotionPreference = () => {
      resetPointer();
      schedule(true);
    };

    const updateVisibility = () => {
      if (document.visibilityState !== "visible") {
        if (frame) window.cancelAnimationFrame(frame);
        if (timer) window.clearTimeout(timer);
        frame = 0;
        timer = 0;
      } else {
        schedule(true);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      root.classList.toggle("is-control-plane-visible", state.visible);
      if (!state.visible) {
        if (frame) window.cancelAnimationFrame(frame);
        if (timer) window.clearTimeout(timer);
        frame = 0;
        timer = 0;
      } else {
        schedule(true);
      }
    }, { rootMargin: "120px" });

    observer.observe(hero);
    window.addEventListener("scroll", updateScroll, { passive: true });
    stage.addEventListener("pointermove", updatePointer, { passive: true });
    stage.addEventListener("pointerleave", resetPointer, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);
    reducedQuery.addEventListener("change", updateMotionPreference);
    coarseQuery.addEventListener("change", updateMotionPreference);
    updateScroll();
    schedule(true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
      stage.removeEventListener("pointermove", updatePointer);
      stage.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", updateVisibility);
      reducedQuery.removeEventListener("change", updateMotionPreference);
      coarseQuery.removeEventListener("change", updateMotionPreference);
      if (frame) window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      root.style.removeProperty("--cp-progress");
      root.style.removeProperty("--cp-handoff");
      root.style.removeProperty("--cp-evidence");
    };
  }, [rootRef]);
}
