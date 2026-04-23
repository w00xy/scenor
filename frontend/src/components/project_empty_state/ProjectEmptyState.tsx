import React, { JSX } from "react";
import "./ProjectEmptyState.scss";

interface ProjectEmptyStateProps {
  className?: string;
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  onAction?: () => void;
}

export function ProjectEmptyState({
  className = "",
  title,
  subtitle,
  description,
  actionText,
  onAction,
}: ProjectEmptyStateProps): JSX.Element {
  return (
    <section className={`project-empty-state ${className}`.trim()}>
      <div className="project-empty-state__heading">
        <h2 className="project-empty-state__title">{title}</h2>
        <p className="project-empty-state__subtitle">{subtitle}</p>
      </div>

      <p className="project-empty-state__description">{description}</p>

      <button
        type="button"
        className="project-empty-state__action"
        onClick={onAction}
      >
        {actionText}
      </button>
    </section>
  );
}
