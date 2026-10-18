import { useState } from "react";
import DOMPurify from "dompurify";
import { imageUrl, type Project } from "../lib/model";
import { Modal } from "./Modal";
import { ExternalLink } from "./ExternalLink";
export function ReviewModal({
  project: p,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const images = [p.desktop, ...p.gallery];
  const [selected, setSelected] = useState(0);
  const html = DOMPurify.sanitize(p.review, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "s", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href"],
  });
  const fragment = document.createElement("template");
  fragment.innerHTML = html;
  fragment.content.querySelectorAll("a").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
  return (
    <Modal title={`Review: ${p.title}`} onClose={onClose}>
      <header className="modal-header">
        <div>
          <h2>
            <ExternalLink href={p.url}>{p.title}</ExternalLink>
          </h2>
          <p>
            Created by{" "}
            <ExternalLink href={p.developerUrl}>{p.developer}</ExternalLink>
          </p>
        </div>
        <button className="button" onClick={onClose} autoFocus>
          Close
        </button>
      </header>
      <img
        className="review-main"
        src={imageUrl(images[selected])}
        alt={images[selected].alt}
      />
      {images.length > 1 && (
        <div
          className="thumbnail-strip"
          role="group"
          aria-label="Project images"
        >
          {images.map((img, i) => (
            <button
              key={img.file + i}
              className={`thumbnail ${i === selected ? "selected" : ""}`}
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
              aria-pressed={selected === i}
            >
              <img src={imageUrl(img)} alt="" />
            </button>
          ))}
        </div>
      )}
      <div
        className="prose review-copy"
        dangerouslySetInnerHTML={{ __html: fragment.innerHTML }}
      />
      <ul className="review-categories" aria-label="Categories">
        {p.categories.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div className="modal-actions">
        <ExternalLink className="button button-mint" href={p.url}>
          Try it! <span aria-hidden="true">↗</span>
        </ExternalLink>
      </div>
    </Modal>
  );
}
