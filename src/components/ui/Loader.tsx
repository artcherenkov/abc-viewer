import clsx from "clsx";
import React from "react";

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-6",
  xl: "w-16 h-16 border-8",
} as const;

const Spinner = ({ size = "md" }: { size?: keyof typeof sizeClasses }) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          "border-t-transparent border-solid rounded-full animate-spin",
          sizeClasses[size],
        )}
      ></div>
    </div>
  );
};

export default Spinner;
