import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./button";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton({ label, children, ...rest }, ref) {
    return (
      <Button ref={ref} variant="icon" aria-label={label} title={label} {...rest}>
        {children}
      </Button>
    );
  },
);
