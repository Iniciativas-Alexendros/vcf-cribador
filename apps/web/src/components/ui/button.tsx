import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "tertiary" | "danger" | "icon";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    loading = false,
    children,
    className = "",
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`zed-button zed-button--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="zed-spinner" aria-hidden /> : null}
      {children}
    </button>
  );
});
