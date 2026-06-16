interface ArticleCardProps {
  title: string;
  authors: string;
  year: number;
  database: string;
  relevance: "high" | "medium" | "low";
  abstract?: string;
  doi?: string;
}

const relevanceConfig = {
  high: { bg: "var(--green-100)", text: "var(--green-700)", label: "Alta" },
  medium: { bg: "#EBF4FD", text: "#1B6FA8", label: "Media" },
  low: { bg: "#FEF0EC", text: "#A33820", label: "Baja" },
};

export function ArticleCard({
  title,
  authors,
  year,
  database,
  relevance,
  abstract,
  doi,
}: ArticleCardProps) {
  const config = relevanceConfig[relevance];

  return (
    <article className="cursor-pointer bg-white border border-border rounded-lg p-4 sm:p-6 hover:shadow-green transition-all duration-200 hover:-translate-y-1 flex flex-col">
      <div className="flex flex-col gap-2 sm:gap-3 mb-4">
        <div className="flex gap-2 flex-wrap items-start">
          <span
            className="text-xs font-medium px-2 py-1 rounded-sm flex-shrink-0"
            style={{ backgroundColor: config.bg, color: config.text }}
          >
            {config.label}
          </span>
          <span className="text-xs text-text-light px-2 py-1 bg-bg rounded-sm flex-shrink-0">
            {database}
          </span>
          <span className="text-xs text-text-muted ml-auto flex-shrink-0">{year}</span>
        </div>

        <h3 className="font-semibold text-navy text-sm sm:text-base leading-snug">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-text-muted">
          {authors}
        </p>
      </div>

      {abstract && (
        <p className="text-xs sm:text-sm text-text-muted mb-3 line-clamp-3">
          {abstract}
        </p>
      )}

      <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
        {doi && (
          <a
            href={`https://doi.org/${doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-green-700 hover:text-green-900 transition-colors"
          >
            DOI
          </a>
        )}
        <button className="text-xs font-medium text-green-700 hover:text-green-900 transition-colors ml-auto">
          Ver más
        </button>
      </div>
    </article>
  );
}
