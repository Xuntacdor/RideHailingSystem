
// src/utils/passwordStrength.js
export function checkPasswordStrength(password) {
  if (!password) return "";
  if (password.length < 6) return "Yếu";
  if (password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)) return "Trung bình";
  if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)) return "Mạnh";
  return "Trung bình";
}