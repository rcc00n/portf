const getQueue = () => {
  if (typeof window === "undefined") return null;
  if (!window.__studioAnalyticsQueue) {
    window.__studioAnalyticsQueue = [];
  }
  return window.__studioAnalyticsQueue;
};

export const trackEvent = (name, payload = {}) => {
  const queue = getQueue();
  if (!queue) return;
  const path = payload.path || window.location.pathname;
  const event = {
    name,
    path,
    ts: Date.now(),
    ...payload,
  };
  queue.push(event);
  if (import.meta.env.DEV) {
    console.info("[analytics]", event);
  }
};

export const trackPageView = (path) => {
  trackEvent("page_view", { path });
};

export const trackCtaClick = (label, to, meta = {}) => {
  trackEvent("cta_click", { label, to, ...meta });
};
