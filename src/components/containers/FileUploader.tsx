"use client";

import { CircleCheck, File } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";

import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Loader";
import { invalidateCacheTag } from "@/lib/actions/cache/invalidateCacheTag";

const FileUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [visualProgress, setVisualProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Логика загрузки файла
  const handleUpload = useCallback(async () => {
    if (!file) {
      return;
    }

    try {
      setVisualProgress(0);

      // Шаг 1: Получение Signed URL
      const res = await fetch("/api/files/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { signedUrl, fileKey } = await res.json();

      // Шаг 2: Загрузка файла в S3
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setVisualProgress(progress);
        }
      };
      xhr.open("PUT", signedUrl, true);
      xhr.setRequestHeader("Content-Type", "application/xml");
      xhr.send(file);

      await new Promise((resolve, reject) => {
        xhr.onload = resolve;
        xhr.onerror = reject;
      });

      // Шаг 3: Подтверждение загрузки
      const confirmRes = await fetch("/api/files/confirm-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey,
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      if (!confirmRes.ok) throw new Error("Failed to confirm upload");

      await invalidateCacheTag("files");
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setFile(null);
        setVisualProgress(0);
      }, 3000);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file, handleUpload]);

  return (
    <div className="flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <Button className="btn self-start mt-4" onClick={handleButtonClick}>
        Выбрать файл
      </Button>

      {file && (
        <div className="absolute bottom-0 right-24 w-1/3 bg-white rounded-lg rounded-br-none rounded-bl-none shadow-md overflow-hidden">
          <div className="p-6 bg-zinc-300 relative">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${visualProgress}%` }}
            ></div>
          </div>
          <div className="p-4 pb-8">
            <div className="flex items-center gap-2">
              <File />
              {file?.name || "text.xml"}
              <div className="ml-auto">
                {visualProgress === 100 ? (
                  <CircleCheck
                    size={28}
                    color={colors.white}
                    fill={colors.green["500"]}
                  />
                ) : (
                  <Spinner />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
