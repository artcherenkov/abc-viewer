import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { prisma } from "../../../../../prisma/prisma";

export const POST = async (req: NextRequest) => {
  const authSession = await auth();

  if (!authSession || !authSession.user?.id) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  const { fileKey, fileName, fileSize } = (await req.json()) as {
    fileName: string;
    fileKey: string;
    fileSize: number;
  };

  // Валидация данных
  if (!fileKey || !fileName || !fileSize) {
    return NextResponse.json({ status: "Invalid input" }, { status: 400 });
  }

  // Проверка на дублирование
  const existingFile = await prisma.file.findUnique({
    where: {
      userId_fileKey: {
        userId: authSession.user.id,
        fileKey: fileKey,
      },
    },
  });

  if (existingFile) {
    return NextResponse.json(
      { status: "File already exists" },
      { status: 409 },
    );
  }

  // Сохранение метаданных
  await prisma.file.create({
    data: {
      userId: authSession.user.id,
      fileKey,
      fileName,
      fileSize,
    },
  });

  return NextResponse.json({ status: "File metadata saved" }, { status: 200 });
};
