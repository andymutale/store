// ─── PASSWORD HASHING ─────────────────────────────────────────────────────────
// Uses Web Crypto API (built into Node 18+). No extra packages needed.
// To generate a hash: npx ts-node scripts/hashPassword.ts yourPassword

export async function isValidPassword(password: string, hashedPassword: string) {
  return (await hashPassword(password)) === hashedPassword
}

async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  )
  return Buffer.from(arrayBuffer).toString("base64")
}
