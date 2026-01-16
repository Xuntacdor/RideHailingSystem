import React from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

export default function Popup({ open, message, type = "info", onClose }) {
  if (!open) return null;
  let color = "bg-blue-50 text-blue-700 border-blue-400";
  let Icon = Info;
  if (type === "success") {
    color = "bg-green-50 text-green-700 border-green-400";
    Icon = CheckCircle2;
  }
  if (type === "error") {
    color = "bg-red-50 text-red-700 border-red-400";
    Icon = XCircle;
  }
  if (type === "warning") {
    color = "bg-yellow-50 text-yellow-700 border-yellow-400";
    Icon = AlertTriangle;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur">
      <div className={`min-w-72 max-w-[90vw] p-7 rounded-xl border shadow-lg flex flex-col items-center gap-2 ${color}`}>
        <Icon size={40} className="mb-2" />
        <span className="mb-2 font-semibold text-lg text-center">{message}</span>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-5 py-1.5 rounded hover:bg-blue-600 transition font-medium mt-2"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}