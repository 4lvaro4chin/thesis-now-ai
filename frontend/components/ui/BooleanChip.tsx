interface BooleanChipProps {
  type: "AND" | "OR" | "NOT" | "TRUNC";
  label?: string;
  selected?: boolean;
  onClick?: () => void;
}

const typeStyles = {
  AND: "bg-[var(--and-bg)] text-[var(--and-text)]",
  OR: "bg-[var(--or-bg)] text-[var(--or-text)]",
  NOT: "bg-[var(--not-bg)] text-[var(--not-text)]",
  TRUNC: "bg-[var(--trc-bg)] text-[var(--trc-text)]",
};

export function BooleanChip({ type, label, selected = false, onClick }: BooleanChipProps) {
  return (
    <button
      onClick={onClick}
      className={`${typeStyles[type]} px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm font-mono text-xs sm:text-sm font-medium transition-all duration-200 ${
        selected ? "ring-2 ring-offset-2 ring-offset-white scale-95" : "hover:scale-105 hover:-translate-y-0.5"
      }`}
    >
      {label || type}
    </button>
  );
}
