"use client";
import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  variant = "primary",
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      className={clsx(
        "shadow w-64 h-10 rounded-md font-body font-bold hover:opacity-80",
        props.disabled && "text-gray-400",
        props.className
      )}
      style={
        props.disabled
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
