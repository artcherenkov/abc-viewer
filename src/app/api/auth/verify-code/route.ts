import { NextResponse } from "next/server";

import { prisma } from "../../../../../prisma/prisma";

export async function POST(request: Request) {
  const { email, code } = await request.json();

  const verificationCode = await prisma.verificationCode.findFirst({
    where: { email, code },
  });

  if (!verificationCode || verificationCode.expires < new Date()) {
    return NextResponse.json(
      { error: "Неверный или истекший код" },
      { status: 400 },
    );
  }

  // Удаляем код после успешной проверки
  await prisma.verificationCode.delete({
    where: { id: verificationCode.id },
  });

  return NextResponse.json({ message: "Код подтвержден" });
}
