// Shared by native modal dialogs. Fixed body also stops background touch scroll
// on iOS, while the saved scrollbar width prevents a desktop layout shift.
export function lockDocumentScroll() {
  const root = document.documentElement;
  const body = document.body;
  const { scrollX, scrollY } = window;
  const scrollbar = Math.max(0, window.innerWidth - root.clientWidth);
  const saved = [];
  const set = (element, property, value) => {
    saved.push([element, property, element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
    element.style.setProperty(property, value);
  };
  set(root, "overflow", "hidden");
  set(body, "position", "fixed");
  set(body, "top", `${-scrollY}px`);
  set(body, "left", `${-scrollX}px`);
  set(body, "width", `calc(100vw - ${scrollbar}px)`);
  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    for (const [element, property, value, priority] of saved) {
      if (value) element.style.setProperty(property, value, priority);
      else element.style.removeProperty(property);
    }
    window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
  };
}
