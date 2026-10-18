import { useSyncExternalStore } from "react";
import type { Project } from "../lib/model";
import { imageUrl } from "../lib/model";
import { ExternalLink } from "./ExternalLink";
export function ProjectCard({
  project: p,
  onReview,
  onEdit,
  onVisit,
}: {
  project: Project;
  onReview: (trigger: HTMLButtonElement) => void;
  onEdit?: () => void;
  onVisit?: (destination: "project" | "developer") => void;
}) {
  const mobile = useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia("(max-width: 767px)");
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
  return (
    <article className="project-card min-w-0">
      <div className="card-visual">
        <ExternalLink
          className="project-link"
          href={p.url}
          onClick={() => onVisit?.("project")}
          aria-label={`GO ${p.title} (opens in a new tab)`}
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={imageUrl(p.mobile)} />
            <img
              src={imageUrl(p.desktop)}
              alt={mobile ? p.mobile.alt : p.desktop.alt}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.classList.add("image-unavailable");
              }}
            />
          </picture>
          <span className="go" aria-hidden="true">
            GO <span>↗</span>
          </span>
          <h2>{p.title}</h2>
        </ExternalLink>
        {onEdit && (
          <button
            className="button edit-button"
            onClick={onEdit}
            aria-label={`Edit ${p.title}`}
          >
            Edit
          </button>
        )}
      </div>
      <div className="card-meta">
        <p>
          By{" "}
          <ExternalLink
            href={p.developerUrl}
            onClick={() => onVisit?.("developer")}
          >
            {p.developer}
          </ExternalLink>
        </p>
        <button
          className="review-button"
          onClick={(event) => onReview(event.currentTarget)}
          aria-label={`Read review of ${p.title}`}
        >
          Read review <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
