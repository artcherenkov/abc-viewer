import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { CredentialsSignin } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { v4 as uuid } from "uuid";

import { SignInFormSchema } from "@/lib/descriptions/signInFormSchema";

import { prisma } from "../prisma/prisma";

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedCredentials = SignInFormSchema.parse(credentials);

        const user = await prisma.user.findFirst({
          where: { email: validatedCredentials.email },
        });

        if (!user) throw new CredentialsSignin();

        const isPasswordValid = await bcrypt.compare(
          validatedCredentials.password,
          user.password || "",
        );

        if (!isPasswordValid) throw new CredentialsSignin();

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }

      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) throw new Error("Ошибка при создании сессии");

        return sessionToken;
      }

      return defaultEncode(params);
    },
  },
});
