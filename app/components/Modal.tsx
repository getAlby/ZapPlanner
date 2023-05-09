import clsx from "clsx";
import React from "react";

type ModalProps = {
  launcher: React.ReactElement;
  className?: string;
  modalId?: string;
};

export function Modal({
  children,
  launcher,
  className,
  modalId,
}: React.PropsWithChildren<ModalProps>) {
  return (
    <>
      {React.cloneElement(launcher, { htmlFor: modalId })}

      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className={clsx("modal-box relative", className)}>
          <label
            htmlFor={modalId}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </label>
          {children}
        </div>
      </div>
    </>
  );
}
