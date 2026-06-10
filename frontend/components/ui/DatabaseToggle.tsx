interface DatabaseToggleProps {
  name: string;
  selected?: boolean;
  onChange?: (selected: boolean) => void;
}

export function DatabaseToggle({ name, selected = true, onChange }: DatabaseToggleProps) {
  return (
    <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
        selected
          ? "border-green-500 bg-green-500"
          : "border-border group-hover:border-green-400"
      }`}>
        {selected && (
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm sm:text-base font-medium text-text-mid group-hover:text-green-700 transition-colors duration-200">
        {name}
      </span>
    </label>
  );
}
