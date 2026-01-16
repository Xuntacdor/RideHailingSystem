import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Popup from "../../../components/common/Popup";
import { login } from "../api/authApi";

export default function LoginForm({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "", type: "info" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      // Giả sử backend trả về { results: { token: "...", userId: "..." } }
      localStorage.setItem("token", res.data.results.token);
      localStorage.setItem("userId", res.data.results.userId);
      setPopup({ open: true, message: "Đăng nhập thành công!", type: "success" });
      setTimeout(() => navigate("/profile"), 1000);
    } catch {
      setPopup({ open: true, message: "Sai tài khoản hoặc mật khẩu!", type: "error" });
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <Popup
        open={popup.open}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
      />
      <h2 className="text-3xl font-bold mb-2 mt-2">Welcome back</h2>
      <p className="text-gray-400 mb-10">Please login to your account</p>
      <div>
        <label className="text-gray-500 mb-2 block text-sm">Email</label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-500 outline-none text-blue-700 font-semibold bg-transparent"
          placeholder="Your email"
        />
      </div>
      <div>
        <label className="text-gray-500 mb-2 block text-sm">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border-b border-gray-300 focus:border-blue-500 outline-none text-blue-700 font-semibold bg-transparent"
            placeholder="••••••••"
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div></div>
        <a href="#" className="text-blue-500 text-sm font-semibold hover:underline">
          Forgot Password?
        </a>
      </div>
      <Button type="submit">Login</Button>
      <div className="w-full flex items-center justify-center mt-4">
        <span className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <a href="#" onClick={e => { e.preventDefault(); onSwitchToSignUp(); }} className="text-blue-500 font-semibold hover:underline">
            Sign up
          </a>
        </span>
      </div>
    </form>
  );
}