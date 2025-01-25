import { prisma } from "../../../../prisma/prisma";

export async function GET() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);

  return Response.json({ allUsers });
}
