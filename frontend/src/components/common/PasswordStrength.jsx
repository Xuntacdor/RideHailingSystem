import React from "react";

export default function PasswordStrength({ strength }) {
  let color = "text-gray-400";
  if (strength === "Yếu") color = "text-red-500";
  else if (strength === "Trung bình") color = "text-yellow-500";
  else if (strength === "Mạnh") color = "text-green-500";

  if (!strength) return null;
  return (
    <div className={`mt-1 text-sm font-semibold ${color}`}>
      Độ mạnh mật khẩu: {strength}
    </div>
  );
}