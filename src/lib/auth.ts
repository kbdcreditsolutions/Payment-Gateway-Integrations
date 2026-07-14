import crypto from "crypto";
import bcrypt from "bcryptjs";

// Constant-time-ish comparison for the bootstrap admin credential.
// Prefers ADMIN_PASSWORD_HASH (bcrypt) when set; falls back to ADMIN_PASSWORD (plaintext, dev-only).
export async function checkAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  if (!expectedEmail || email.toLowerCase() !== expectedEmail.toLowerCase()) {
    return false;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compare(password, hash);
  }

  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;

  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(plain).digest();
  return crypto.timingSafeEqual(a, b);
}
