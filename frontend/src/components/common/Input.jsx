import React from "react";

export default function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={
        "w-full px-4 py-2 border-b border-gray-300 focus:border-blue-500 outline-none text-blue-700 font-semibold bg-transparent " +
        className
      }
      {...props}
    />
  );
}