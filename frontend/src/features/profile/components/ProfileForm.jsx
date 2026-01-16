import React, { useState } from "react";
import { Eye, EyeOff, Upload, Car } from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import { uploadAvatar } from "../api/userApi";

export default function ProfileForm({ user }) {
  // user nhận từ props: { fullName, email, role, carModel, avatarUrl, ... }
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [carModel, setCarModel] = useState(user?.carModel || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");

  // Hàm xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: gọi API cập nhật profile
    alert("Cập nhật thành công!");
  };

  // Hàm chọn file avatar

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Hiển thị ảnh ngay để user thấy
      setAvatar(URL.createObjectURL(file));
      try {
        // Gọi API upload lên server
        const response = await uploadAvatar(user.id, file);
        // Lấy link avatar mới từ response và cập nhật lại cho FE
        const newAvatarUrl = response.data.results.imageUrl;
        setAvatar(newAvatarUrl);
        alert("Cập nhật ảnh đại diện thành công!");
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        alert("Lỗi upload ảnh đại diện!");
      }
    }
  };

  return (
    <form
      className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-2">Thông tin cá nhân</h2>
      <div className="flex flex-col items-center gap-2">
        <img
          src={avatar || "https://i.pravatar.cc/120"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-300"
        />
        <label className="text-blue-500 cursor-pointer flex items-center gap-2">
          <Upload size={18} /> Đổi ảnh
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      <div>
        <label className="text-gray-500 mb-1 block text-sm">Họ tên</label>
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nhập họ tên"
        />
      </div>

      <div>
        <label className="text-gray-500 mb-1 block text-sm">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
        />
      </div>

      <div>
        <label className="text-gray-500 mb-1 block text-sm">Mật khẩu mới</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      {/* Nếu là tài xế, hiển thị thêm trường xe */}
      {user?.role === "driver" && (
        <div>
          <label className="text-gray-500 mb-1 block text-sm flex items-center gap-1">
            <Car size={16} /> Thông tin xe
          </label>
          <Input
            type="text"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="Ví dụ: Toyota Vios"
          />
        </div>
      )}

      <Button type="submit">Cập nhật</Button>
    </form>
  );
}
