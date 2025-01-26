import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

import s3Client from "../../../../../s3/client";

export const POST = auth(async (req) => {
  const { auth } = req;

  if (!auth) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  const { fileName, fileSize } = await req.json();

  // Валидация данных
  if (!fileName || typeof fileName !== "string") {
    return NextResponse.json({ status: "Invalid file name" }, { status: 400 });
  }
  if (
    !fileSize ||
    typeof fileSize !== "number" ||
    fileSize > 1 * 1024 * 1024 * 1024
  ) {
    return NextResponse.json({ status: "Invalid file size" }, { status: 400 });
  }

  // Генерация уникального ключа файла
  const fileKey = `${auth.user?.id}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;

  // Генерация Signed URL
  const command = new PutObjectCommand({
    Bucket: process.env.YC_BUCKET_NAME!,
    Key: fileKey,
    ContentType: "application/xml",
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return NextResponse.json(
    {
      status: "Success",
      signedUrl,
      fileKey,
    },
    { status: 200 },
  );
});
