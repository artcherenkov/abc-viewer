import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CredentialsSignin } from "next-auth";

export const isUserAlreadyExistsError = (error: unknown) => {
  return (
    error instanceof PrismaClientKnownRequestError &&
    error.name === "PrismaClientKnownRequestError"
  );
};

export const isInvalidPasswordError = (error: unknown) => {
  return error instanceof CredentialsSignin && error.code === "credentials";
};
