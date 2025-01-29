import { prisma } from "../../../prisma/prisma";

export const generateVerificationToken = async (email: string) => {
  const token = Math.random().toString(36).slice(2);
  const expires = new Date(Date.now() + 3600 * 1000); // 1 час

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          token: existingToken.token,
          identifier: existingToken.identifier,
        },
      },
    });
  }

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
};
