import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const sslCertPath = process.env.PG_SSL_CERT_PATH;
const allowSelfSigned =
  process.env.PG_SSL_NO_VERIFY === "true" &&
  process.env.NODE_ENV !== "production";

let ssl: { rejectUnauthorized: boolean; ca?: string } | undefined;

if (sslCertPath) {
  try {
    const certPaths = sslCertPath
      .split(";")
      .flatMap((entry) => entry.split(","))
      .map((entry) => entry.trim())
      .filter(Boolean);

    const caBundle = certPaths
      .map((entry) =>
        path.isAbsolute(entry) ? entry : path.resolve(process.cwd(), entry),
      )
      .map((entry) => fs.readFileSync(entry, "utf8"))
      .join("\n");

    ssl = {
      rejectUnauthorized: true,
      ca: caBundle,
    };
  } catch (error) {
    console.error(
      `[Prisma] Unable to read PG_SSL_CERT_PATH at ${sslCertPath}`,
      error,
    );
  }
} else if (allowSelfSigned) {
  ssl = { rejectUnauthorized: false };
}

const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pgPool;

const adapter = new PrismaPg(pgPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
