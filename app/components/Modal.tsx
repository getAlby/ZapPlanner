import React from "react";

type ModalProps = {
  launcher: React.ReactElement;
};

const modalId = "zp-modal";

export function Modal({
  children,
  launcher,
}: React.PropsWithChildren<ModalProps>) {
  return (
    <>
      {React.cloneElement(launcher, { htmlFor: modalId })}

      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
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
