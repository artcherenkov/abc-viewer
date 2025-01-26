"use client";

import React, { useState } from "react";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setStatusMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusMessage("Выберите файл.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

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
          setUploadProgress(progress);
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

      setStatusMessage("Файл успешно загружен!");
    } catch (error) {
      console.error(error);
      setStatusMessage("Ошибка при загрузке файла.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
    }
  };

  return (
    <div className="mt-10 flex flex-col">
      <p className="text text-xl">Загрузить файл</p>
      <input
        type="file"
        className="file-input file-input-bordered w-full max-w-xs mt-4"
        accept=".xml"
        placeholder="wtf"
        onChange={handleFileChange}
      />
      <button
        className="btn self-start mt-4"
        onClick={handleUpload}
        disabled={isUploading || !file}
      >
        {isUploading ? "Загрузка..." : "Загрузить"}
      </button>
      {uploadProgress > 0 && <p>Прогресс: {uploadProgress}%</p>}
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default FileUploader;
