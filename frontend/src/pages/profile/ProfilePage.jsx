import React, { useEffect, useState } from "react";
import ProfileForm from "../../features/profile/components/ProfileForm";
import { getUserInfo } from "../../features/profile/api/userApi";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getUserIdFromJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId || null;
  } catch {
    return null;
  }
}
  // useEffect được gọi không có điều kiện ở top level
useEffect(() => {
  const fetchUserInfo = async () => {
  const token = localStorage.getItem("token");
  let userId = getUserIdFromJwt(token);
    if (!userId) {
      setError("Không tìm thấy userId, vui lòng đăng nhập lại!");
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getUserInfo(userId);
      setUser(res.data.results);
      setError("");
    } catch {
      setError("Lỗi khi lấy thông tin cá nhân!");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  fetchUserInfo();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-blue-100">
        <div>Đang tải thông tin cá nhân...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-blue-100">
        <div>{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-blue-100">
        <div>Không tìm thấy thông tin user.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-100">
      <ProfileForm user={user} />
    </div>
  );
}