#!/usr/bin/env node
// scripts/setup-test-db.js
// Run once before integration tests: node scripts/setup-test-db.js
// Also called automatically by the `test:integration` npm script.

const { execSync } = require("child_process")
const path = require("path")
const fs   = require("fs")

const testDbPath = path.resolve(__dirname, "../prisma/test.db")
const env = { ...process.env, DATABASE_URL: `file:${testDbPath}` }

console.log("🗄️  Setting up test database:", testDbPath)

// Remove stale test DB so migrations always run clean
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath)
  console.log("   Removed stale test.db")
}

try {
  execSync("npx prisma migrate deploy", {
    env,
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  })
  console.log("✅  Test database ready\n")
} catch (err) {
  console.error("❌  Migration failed:", err.message)
  process.exit(1)
}
