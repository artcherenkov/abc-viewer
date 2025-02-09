"use server";

import { format } from "date-fns";
import { File } from "lucide-react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import React from "react";
import colors from "tailwindcss/colors";

import { auth } from "@/auth";
import { formatBytes } from "@/lib/helpers/formatBytes";
import { getFiles as getFilesDal } from "@/lib/repositories/file";

import { prisma } from "../../../prisma/prisma";

const getFiles = unstable_cache(
  async (userId: string) => getFilesDal(prisma, userId),
  ["files"],
  { tags: ["files"] },
);

export const FilesList = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return redirect("sign-in");
  }
  const { user } = session;

  const files = await getFiles(user.id!);

  return (
    <ul className="mt-4 flex flex-col overflow-scroll pb-8">
      {files.map((file) => (
        <li key={file.id}>
          <div className="flex items-center gap-4 py-2 px-4 hover:bg-muted/50 rounded-xl">
            <File fill={colors.gray[100]} strokeWidth={0.25} size={36} />
            <p className="grow">{file.fileName}</p>
            <p className="w-16 text-zinc-500 text-sm text-center text">
              {formatBytes(file.fileSize)}
            </p>
            <p className="w-24 text-zinc-500 text-sm text-center">
              {format(file.uploadedAt, "dd.MM.yyyy")}
            </p>
            <p className="w-16 text-zinc-500 text-sm text-center text">
              {format(file.uploadedAt, "kk:mm")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};
