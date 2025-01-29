import { NextResponse } from "next/server";

import { prisma } from "../../../../../prisma/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ error: "Некорректный URL" }, { status: 400 });
  }

  // Ищем токен в базе данных
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { token, identifier: email } },
  });

  // Проверяем, что токен существует и не истек
  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "Неверный или истекший токен" },
      { status: 400 },
    );
  }

  // Обновляем пользователя
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Удаляем токен
  await prisma.verificationToken.delete({
    where: { identifier_token: { token, identifier: email } },
  });

  return NextResponse.redirect(process.env.BASE_URL + "/dashboard");
}
