import { useId, useRef, useState } from "react";
import { imageAlt } from "../projects/catalog.js";
import "./project-gallery.css";

export default function ProjectGallery({ project }) {
  const dialog = useRef(null);
  const opener = useRef(null);
  const closeButton = useRef(null);
  const titleId = useId();
  const instructionsId = useId();
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const media = [...project.media].sort((a, b) => a.order - b.order || a.id - b.id);
  if (media.length < 2) return null;
  const current = Math.min(index, media.length - 1);
  const image = media[current];
  const move = direction => setIndex(value => (value + direction + media.length) % media.length);
  const close = () => dialog.current?.close();
  const open = () => {
    setIndex(0);
    setIsOpen(true);
    dialog.current.showModal();
    closeButton.current.focus({ preventScroll: true });
  };

  return <>
    <button ref={opener} type="button" className="site-gallery-trigger" aria-label={`${project.title}: view ${media.length} images`} aria-haspopup="dialog" onClick={open}>
      View {media.length} images <span aria-hidden="true">↗</span>
    </button>
    <dialog ref={dialog} className="site-project-gallery" aria-labelledby={titleId} aria-describedby={instructionsId}
      onClose={() => {
        setIsOpen(false);
        opener.current?.focus({ preventScroll: true });
      }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      }}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        // Keep the native modal's keyboard cycle within its controls; browsers
        // otherwise allow a stop in browser chrome at either end of the cycle.
        if (event.key === "Tab") {
          const controls = event.currentTarget.querySelectorAll("button");
          const first = controls[0], last = controls[controls.length - 1];
          if (event.shiftKey && event.target === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && event.target === last) {
            event.preventDefault();
            first.focus();
          }
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <header className="site-gallery-header">
        <div><span className="site-label">Project evidence</span><h2 id={titleId}>{project.title}</h2></div>
        <button ref={closeButton} type="button" onClick={close}>Close <span aria-hidden="true">×</span></button>
      </header>
      <figure className="site-gallery-figure">
        {isOpen && <img key={image.id} src={image.url} alt={imageAlt(project, image, current)} decoding="async" />}
        <figcaption aria-live="polite" aria-atomic="true">{imageAlt(project, image, current)}</figcaption>
      </figure>
      <footer className="site-gallery-footer">
        <span className="site-gallery-count" aria-live="polite" aria-atomic="true">{String(current + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span>
        <span id={instructionsId} className="site-gallery-instructions">Arrow keys to browse. Esc to close.</span>
        <div className="site-gallery-controls">
          <button type="button" aria-label="Previous image" onClick={() => move(-1)}><span aria-hidden="true">←</span></button>
          <button type="button" aria-label="Next image" onClick={() => move(1)}><span aria-hidden="true">→</span></button>
        </div>
      </footer>
    </dialog>
  </>;
}
