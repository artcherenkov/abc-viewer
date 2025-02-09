export const uploadFile = async (
  file: File | null,
  onUploadingProgress?: (e: ProgressEvent<EventTarget>) => void,
) => {
  if (!file) {
    throw new Error("No file provided");
  }

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
  if (onUploadingProgress) {
    xhr.upload.onprogress = onUploadingProgress;
  }
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
};
