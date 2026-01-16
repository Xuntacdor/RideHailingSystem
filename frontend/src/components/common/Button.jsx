import React from "react";

export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "w-full bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white font-bold py-2 rounded shadow text-lg " +
        className
      }
    >
      {children}
    </button>
  );
}