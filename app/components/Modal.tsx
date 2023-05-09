"use client";
import clsx from "clsx";
import React from "react";

type ModalProps = {
  launcher: React.ReactElement;
  className?: string;
};

export function Modal({
  children,
  launcher,
  className,
}: React.PropsWithChildren<ModalProps>) {
  const [isOpen, setOpen] = React.useState(false);
  return (
    <>
      {React.cloneElement(launcher, { onClick: () => setOpen(true) })}

      <input type="checkbox" className="modal-toggle" />
      {isOpen && (
        <div className="modal">
          <div className={clsx("modal-box relative", className)}>
            <label
              onClick={() => setOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </label>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
