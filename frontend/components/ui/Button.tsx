import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outlined";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantStyles = {
  primary: "bg-green-500 text-white hover:bg-green-700 shadow-green",
  ghost: "bg-transparent text-text-mid hover:text-navy hover:bg-white/50",
  outlined: "bg-transparent border border-[var(--border)] text-text-mid hover:border-green-400 hover:text-green-700",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs sm:text-sm",
  md: "px-4 py-2 text-sm sm:text-base",
  lg: "px-6 py-3 text-base sm:text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
