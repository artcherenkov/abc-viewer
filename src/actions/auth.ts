"use server";

import bcrypt from "bcryptjs";

import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";
import { prisma } from "../../prisma/prisma";

export async function signup(_prevState: unknown, formData: FormData) {
  const fieldsData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // 1. Validate form fields
  const validatedFields = SignUpFormSchema.safeParse(fieldsData);

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      fieldsData,
    };
  }

  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data;
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the user into the database or call an Auth Library's API
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    if (!user) {
      return {
        message: "An error occurred while creating your account.",
      };
    }
  } catch (_err) {
    return {
      message: "An error occurred while creating your account.",
    };
  }

  // TODO:
  // 4. Create user session
  // 5. Redirect user
}

export async function signin(_formData: FormData) {}
