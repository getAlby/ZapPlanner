"use client";
import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "disabled";
  block?: boolean;
};

export function Button({
  children,
  variant = "primary",
  block,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      className={clsx(
        "shadow h-10 rounded-md font-body font-bold hover:opacity-80",
        block ? "w-full" : "w-64",
        (props.disabled || variant === "disabled") && "text-gray-400",
        props.className,
        variant === "primary" ? "text-black" : "text-primary-content"
      )}
      style={
        props.disabled || variant === "disabled"
          ? {}
          : variant === "primary"
          ? {
              background:
                "linear-gradient(180deg, #FFDE6E 63.72%, #F8C455 95.24%)",
            }
          : {
              border: "2px solid #FFDE6E",
            }
      }
    >
      {children}
    </button>
  );
}
