import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

export default function UploadImage({ onChange }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      if(onChange) onChange(file);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full max-w-75 h-37.5 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all duration-300"
        onClick={handleClick}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-30 rounded-md" />
        ) : (
          <div className="flex flex-col items-center">
            <ImagePlus className="text-blue-500 mb-2" size={36} />
            <span className="text-blue-500 font-semibold">Thêm ảnh</span>
            <span className="text-xs text-gray-400 mt-1">Nhấn để chọn ảnh</span>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}