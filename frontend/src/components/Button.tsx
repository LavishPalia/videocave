import { VariantProps, cva } from "class-variance-authority";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const buttonStyles = cva(["transition-colors"], {
  variants: {
    variant: {
      default: [
        "bg-secondary-marginal",
        "hover:bg-secondary-marginal-hover",
        "dark:hover:bg-secondary-marginal-text",
      ],
      ghost: ["dark:hover:bg-gray-500", "hover:bg-gray-100"],
      dark: [
        "bg-secondary-marginal-dark",
        "hover:bg-secondary-marginal-dark-hover",
        "dark:hover:bg-secondary-marginal-dark-hover",
        "text-secondary-marginal",
      ],
      disabled: ["bg-[#272727]"],
    },
    size: {
      default: ["rounded", "p-2"],
      icon: [
        "rounded-full",
        "size-10",
        "flex",
        "items-center",
        "justify-center",
        "p-2.5",
      ],
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">;

const Button = ({ variant, size, className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={twMerge(buttonStyles({ variant, size }), className)}
    />
  );
};

export default Button;
