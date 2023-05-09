import React from "react";

export function Box({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-col p-10 gap-8 bg-base-100 shadow rounded-lg w-full max-w-xl">
      {children}
    </div>
  );
}
