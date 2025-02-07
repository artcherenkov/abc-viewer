import { File } from "lucide-react";
import React from "react";
import colors from "tailwindcss/colors";

export default async function FilesPage() {
  return (
    <div className="p-4 pt-0 max-w-4xl">
      <h2 className="text-2xl font-semibold">Файлы</h2>
      <ul className="mt-4">
        <li>
          <div className="flex items-center gap-4 py-2 px-4 hover:bg-muted/50 rounded-xl">
            <File fill={colors.gray[100]} strokeWidth={0.25} size={36} />
            <p className="grow">Файл 1.gge</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">
              124 КБ
            </p>
            <p className="w-24 text-zinc-500 text-sm text-center">05.02.2025</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">17:48</p>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-4 py-2 px-4 hover:bg-muted/50 rounded-xl">
            <File fill={colors.gray[100]} strokeWidth={0.25} size={36} />
            <p className="grow">Файл 1.gge</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">
              124 КБ
            </p>
            <p className="w-24 text-zinc-500 text-sm text-center">05.02.2025</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">17:48</p>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-4 py-2 px-4 hover:bg-muted/50 rounded-xl">
            <File fill={colors.gray[100]} strokeWidth={0.25} size={36} />
            <p className="grow">Файл 1.gge</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">
              124 КБ
            </p>
            <p className="w-24 text-zinc-500 text-sm text-center">05.02.2025</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">17:48</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
