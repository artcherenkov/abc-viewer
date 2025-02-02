import { InputJsonObject } from "@prisma/client/runtime/library";
import { addMinutes } from "date-fns";

import { prisma } from "../../../prisma/prisma";

const EXPIRATION_MINUTES = 15;

/**
 * Создает новую сессию регистрации
 * @param email - email пользователя
 * @param registrationData - временные данные (например, введенный пароль)
 */
export async function createRegistrationSession(
  email: string,
  registrationData: InputJsonObject,
) {
  // Удаляем старую сессию, если она существует
  await prisma.registrationSession.deleteMany({ where: { email } });

  // Создаем новую сессию
  return prisma.registrationSession.create({
    data: {
      email,
      data: registrationData,
      expiresAt: addMinutes(new Date(), EXPIRATION_MINUTES),
    },
  });
}

/**
 * Получает сессию регистрации по email
 * @param email - email пользователя
 */
export async function getRegistrationSession(email: string) {
  const session = await prisma.registrationSession.findUnique({
    where: { email },
  });

  if (!session || new Date() > new Date(session.expiresAt)) {
    return null; // Сессия не найдена или истекла
  }

  return session;
}

/**
 * Удаляет сессию регистрации по email
 * @param email - email пользователя
 */
export async function deleteRegistrationSession(email: string) {
  await prisma.registrationSession.deleteMany({ where: { email } });
}

/**
 * Очищает устаревшие сессии (по крону или в фоновой задаче)
 */
export async function cleanOldSessions() {
  await prisma.registrationSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
