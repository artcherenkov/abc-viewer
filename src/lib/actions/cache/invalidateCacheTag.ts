"use server";

import { revalidateTag } from "next/cache";

export async function invalidateCacheTag(tag: string) {
  revalidateTag(tag);
}
