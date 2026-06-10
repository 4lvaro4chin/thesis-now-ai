interface ProgressBarProps {
  database: string;
  progress: number;
  status: "waiting" | "searching" | "done";
  count?: number;
}

const statusConfig = {
  waiting: { bg: "bg-border", text: "text-text-muted" },
  searching: { bg: "bg-green-400", text: "text-green-700" },
  done: { bg: "bg-green-500", text: "text-green-700" },
};

export function ProgressBar({
  database,
  progress,
  status,
  count = 0,
}: ProgressBarProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy">{database}</span>
        <span className="text-xs text-text-muted">
          {status === "done" && `${count} artículos`}
          {status === "searching" && "Buscando..."}
          {status === "waiting" && "Esperando..."}
        </span>
      </div>

      <div className="relative w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`${config.bg} h-full transition-all duration-500 ease-out rounded-full ${
            status === "searching" ? "animate-pulse" : ""
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
