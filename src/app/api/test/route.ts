import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import s3Client from "../../../../s3/client";

export async function POST(_req: NextRequest) {
  try {
    // Путь к файлу в репозитории
    const filePath = path.join(process.cwd(), "test-file.ts");

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Читаем содержимое файла
    const fileContent = fs.readFileSync(filePath);
    const fileName = "test-file.ts";
    const bucketName = process.env.YC_BUCKET_NAME;

    // Загружаем файл в S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: "text/plain", // Укажите корректный MIME-тип, если известно
    });

    await s3Client.send(command);

    return NextResponse.json({
      message: "File uploaded successfully!",
      key: fileName,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
