import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Popup from "../../../components/common/Popup";
import { checkPasswordStrength } from "../../../utils/passwordStrength";
import PasswordStrength from "../../../components/common/PasswordStrength";
import axios from "axios";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cccd, setCccd] = useState("");
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [role, setRole] = useState("USER");
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // Xác thực email demo (show OTP input)
  const handleVerifyEmail = () => {
    if (!email) {
      setPopup({ open: true, message: "Bạn cần nhập email!", type: "error" });
      return;
    }
    setShowOtp(true);
    setPopup({
      open: true,
      message: "OTP đã gửi về email (demo)",
      type: "info",
    });
  };

  // Submit đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        name,
        userName,
        phoneNumber,
        password,
        role,
        cccd,
        email,
        otp: showOtp ? otp : undefined,
      });
      setPopup({
        open: true,
        message: `Đăng ký thành công! Bạn đã vào app với vai trò ${role === "DRIVER" ? "Tài xế" : "Khách hàng"}.`,
        type: "success",
      });
      // reset form nếu muốn
      // setName(""); setUserName(""); setPhoneNumber(""); setPassword(""); setRole("CUSTOMER"); setCccd(""); setEmail(""); setOtp(""); setShowOtp(false);
    } catch (err) {
      setPopup({
        open: true,
        message:
          "Đăng ký thất bại! " +
          (err?.response?.data?.message || "Vui lòng kiểm tra lại thông tin."),
        type: "error",
      });
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
      <h2 className="text-3xl font-bold mb-2 mt-2">Create Your Account</h2>
      <p className="text-gray-400 mb-5">
        Create your account to explore exciting features
      </p>

      <div>
        <label className="text-gray-500 mb-1 block text-sm">Tên đầy đủ</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyen Van B"
        />
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">User Name</label>
        <Input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="nguyenvana1234"
        />
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">
          Số điện thoại
        </label>
        <Input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0901234567"
        />
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">Email</label>
        <div className="flex items-center gap-2 relative">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test1@example.com"
          />
          <button
            type="button"
            onClick={handleVerifyEmail}
            className="ml-2 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition"
            title="Xác thực email"
          >
            <ShieldCheck className="text-blue-500" size={20} />
          </button>
        </div>
        {showOtp && (
          <div className="mt-3">
            <label className="text-gray-500 mb-1 block text-sm">OTP Code</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP gửi về email"
            />
          </div>
        )}
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">Mật khẩu</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordStrength(checkPasswordStrength(e.target.value));
            }}
            placeholder="••••••••"
          />
          <PasswordStrength strength={passwordStrength} />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-blue-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </span>
        </div>
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">CCCD</label>
        <Input
          type="text"
          value={cccd}
          onChange={(e) => setCccd(e.target.value)}
          placeholder="012345678901"
        />
      </div>
      <div>
        <label className="text-gray-500 mb-1 block text-sm">
          Vai trò của bạn:
        </label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="USER"
              checked={role === "USER"}
              onChange={() => setRole("USER")}
            />
            <span>Khách hàng</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="DRIVER"
              checked={role === "DRIVER"}
              onChange={() => setRole("DRIVER")}
            />
            <span>Tài xế</span>
          </label>
        </div>
      </div>
      <Button type="submit" className="mt-2">
        Create account
      </Button>
    </form>
  );
}
