import crypto from "crypto";

export function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
