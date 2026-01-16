import React, { useState } from "react";
import LoginForm from "../../features/auth/components/LoginForm";
import RegisterForm from "../../features/auth/components/RegisterForm";

export default function LoginPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#92c9fa]">
      <div className="w-full max-w-4xl h-[650px] bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden mx-2 my-8">
        {/* Left: image/gradient */}
        <div className="hidden md:flex md:w-1/2 h-full items-center justify-center bg-gradient-to-br from-blue-200 to-blue-300">
          <img
            src="https://undraw.co/api/illustrations/4a5e5a7e-8a48-4a0f-9f81-3a3e8f93d2c8"
            alt="Car"
            className="w-48 md:w-72 h-auto"
          />
        </div>
        {/* Right: tabs and form */}
        <div className="w-full md:w-1/2 h-full flex flex-col px-10 py-10">
          {/* Tabs */}
          <div className="relative flex gap-8 mb-6">
            <button
              className={`font-semibold pb-1 text-lg cursor-pointer transition-all duration-300 ${
                tab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-blue-500"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`font-semibold pb-1 text-lg cursor-pointer transition-all duration-300 ${
                tab === "signup"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-400 hover:text-blue-500"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>
          {/* Form */}
          <div className="flex-1 overflow-y-auto relative">
            {tab === "login" ? (
              <LoginForm onSwitchToSignUp={() => setTab("signup")} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setTab("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
