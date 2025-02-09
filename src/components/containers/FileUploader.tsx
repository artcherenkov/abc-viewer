"use client";

import { CircleCheck, File } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import colors from "tailwindcss/colors";

import { Button } from "@/components/ui/Button";
import Spinner from "@/components/ui/Loader";
import { toast } from "@/hooks/useToast";
import { invalidateCacheTag } from "@/lib/actions/cache/invalidateCacheTag";
import { uploadFile } from "@/lib/helpers/uploadFile";

const getErrorMessage = (err: unknown) => {
  return err instanceof Error
    ? err.message
    : "Произошла неожиданная ошибка, попробуйте позже.";
};

const FileUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    handleUpload(selectedFile);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleProgress = useCallback((event: ProgressEvent) => {
    if (event.lengthComputable) {
      const progress = Math.round((event.loaded / event.total) * 100);
      setProgress(progress);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    setTimeout(() => {
      setFile(null);
      setProgress(0);
    }, 3000);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File | null) => {
      try {
        setProgress(0);
        await uploadFile(file, handleProgress);
        await invalidateCacheTag("files");
      } catch (err) {
        const description = getErrorMessage(err);

        toast({ title: "Ошибка", description, variant: "destructive" });
      } finally {
        handleSuccess();
      }
    },
    [handleProgress, handleSuccess],
  );

  return (
    <div className="flex flex-col ml-auto">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        className="btn self-start"
        variant="secondary"
        size="sm"
        onClick={handleButtonClick}
      >
        Загрузить файл
      </Button>

      {file && (
        <div className="absolute bottom-0 right-24 w-1/3 bg-white rounded-lg rounded-br-none rounded-bl-none shadow-md overflow-hidden">
          <div className="p-6 bg-zinc-300 relative">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="p-4 pb-8">
            <div className="flex items-center gap-2">
              <File />
              {file?.name || "text.xml"}
              <div className="ml-auto">
                {progress === 100 ? (
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
