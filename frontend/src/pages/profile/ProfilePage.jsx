// ProfilePage.jsx
import React from "react";
import ProfileForm from "../../features/profile/components/ProfileForm";

export default function ProfilePage() {
  const user = {
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "driver",
    carModel: "Toyota Vios",
    avatarUrl: "",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-100">
      <ProfileForm user={user} />
    </div>
  );
}