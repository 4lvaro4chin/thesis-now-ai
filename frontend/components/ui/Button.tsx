import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outlined";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles = {
  primary: "bg-[var(--green-500)] text-white hover:bg-[var(--green-700)] shadow-[0_2px_8px_rgba(15,110,86,0.3)] hover:shadow-[0_4px_20px_rgba(15,110,86,0.12)]",
  ghost: "bg-transparent text-text-mid hover:text-navy hover:bg-white/50",
  outlined: "border-[1.5px] border-[var(--green-500)] bg-transparent text-[var(--green-500)] hover:bg-[rgba(29,158,117,0.08)] hover:border-[var(--green-700)] hover:text-[var(--green-700)]",
};

const sizeStyles = {
  sm: "px-6 py-1.5 text-xs sm:text-sm min-h-[36px]",
  md: "px-10 py-3 text-sm sm:text-base min-h-[44px] font-600",
  lg: "px-20 py-4 text-base sm:text-lg min-h-[48px] font-600",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  isLoading = false,
  disabled = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-[10px] transition-all duration-200
        ${isDisabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5"}
        ${isLoading ? "cursor-wait" : ""}
        ${className}
      `}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}
