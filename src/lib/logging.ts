import { prisma } from "./prisma";

export async function logError(message: string, meta?: unknown) {
  try {
    await prisma.appLog.create({
      data: {
        level: "error",
        message,
        meta: meta === undefined ? undefined : JSON.parse(JSON.stringify(meta))
      }
    });
  } catch (error) {
    console.error("Failed to write AppLog", error);
  }
}
