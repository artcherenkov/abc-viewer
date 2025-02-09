import React from "react";

import { FilesList } from "@/components/containers/FilesList";
import FileUploader from "@/components/containers/FileUploader";

export default async function FilesPage() {
  return (
    <div className="p-4 pt-0 flex flex-col overflow-hidden">
      <h2 className="text-2xl font-semibold">Файлы</h2>
      <FileUploader />
      <FilesList />
    </div>
  );
}
