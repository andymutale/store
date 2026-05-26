/**
 * Run this once to generate your admin password hash.
 * Usage:  npm run hash-password yourPassword
 * Then paste the output into HASHED_ADMIN_PASSWORD in .env
 */
const password = process.argv[2]

if (!password) {
  console.error("Usage: npm run hash-password <password>")
  process.exit(1)
}

async function hashPassword(password: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  )
  return Buffer.from(buffer).toString("base64")
}

hashPassword(password).then(hash => {
  console.log("\nPaste this into your .env file:")
  console.log(`HASHED_ADMIN_PASSWORD="${hash}"`)
})
