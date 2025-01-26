import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { prisma } from "../../../../prisma/prisma";

export const GET = auth(async (req) => {
  const { auth } = req;

  if (!auth || !auth.user?.id) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  // Получение списка файлов для текущего пользователя
  const files = await prisma.file.findMany({
    where: { userId: auth.user.id },
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      uploadedAt: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(
    {
      status: "Success",
      files,
    },
    { status: 200 },
  );
});
