import { useState, type ReactNode } from "react";
import {
  selectProjects,
  usedCategories,
  type Content,
  type Project,
} from "../lib/model";
import { ProjectCard } from "./ProjectCard";
import { ReviewModal } from "./ReviewModal";
import { ExternalLink } from "./ExternalLink";
const colors = [
  "#213643",
  "#258AE0",
  "#872FCF",
  "#EBE334",
  "#33E689",
  "#EB17D4",
];
export function Gallery({
  content,
  onEdit,
  onAdd,
  toolbar,
}: {
  content: Content;
  onEdit?: (p: Project) => void;
  onAdd?: () => void;
  toolbar?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [review, setReview] = useState<Project | null>(null);
  const categories = usedCategories(content);
  const active = categories.includes(category) ? category : "All";
  const projects = selectProjects(content.projects, query, active);
  return (
    <div className={`site-shell ${onEdit ? "is-editor" : ""}`}>
      <a href="#projects" className="skip-link">
        Skip to projects
      </a>
      <header className="site-header">
        <div className="brand">
          <h1>
            Try AI Games
            <span className="brand-dot" aria-hidden="true" />
          </h1>
          <p>A curated list of AI Games &amp; Experiences</p>
        </div>
        <div className="discovery">
          {categories.length >= 3 && (
            <nav className="category-nav" aria-label="Filter by category">
              <span className="category-label">Categories</span>
              {["All", ...categories].map((c, i) => (
                <button
                  key={c}
                  className={`category-button ${active === c ? "active" : ""}`}
                  aria-pressed={active === c}
                  onClick={() => {
                    setQuery("");
                    setCategory(c);
                  }}
                >
                  {i > 0 && (
                    <span
                      className="category-dot"
                      aria-hidden="true"
                      style={{ background: colors[(i - 1) % colors.length] }}
                    />
                  )}
                  {c}
                </button>
              ))}
            </nav>
          )}
          <div className="search-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
            <label className="sr-only" htmlFor="search">
              Search by project title or category
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search games..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCategory("All");
              }}
            />
          </div>
        </div>
      </header>
      <main id="projects" tabIndex={-1}>
        <span className="sr-only" role="status">
          {projects.length} projects found
        </span>
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onReview={() => setReview(p)}
              onEdit={onEdit ? () => onEdit(p) : undefined}
            />
          ))}
          {onAdd && (
            <button className="add-tile" onClick={onAdd}>
              <span aria-hidden="true">+</span>Add New
            </button>
          )}
        </div>
        {!projects.length && (
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">
              {query ? "⌕" : "✦"}
            </span>
            <h2>
              {query || active !== "All"
                ? "No projects found"
                : "A little space for great discoveries."}
            </h2>
            <p>
              {query || active !== "All"
                ? "Try another title or category."
                : onAdd
                  ? "Add your first project to bring the gallery to life."
                  : "New games and experiences will appear here soon."}
            </p>
            {(query || active !== "All") && (
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  document.getElementById("search")?.focus();
                }}
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}
      </main>
      <footer className="site-footer">
        {new Date().getFullYear()}. Created with ❤️ by{" "}
        <ExternalLink href="https://adrielz.world">Adriel</ExternalLink>
      </footer>
      {review && (
        <ReviewModal
          key={review.id}
          project={review}
          onClose={() => setReview(null)}
        />
      )}
      {toolbar}
    </div>
  );
}
