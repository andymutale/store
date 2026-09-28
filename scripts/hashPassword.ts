import { hashPassword } from '../src/lib/password'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npm run hash-password -- <password>')
  process.exit(1)
}

hashPassword(password)
  .then(hash => {
    console.log(`HASHED_ADMIN_PASSWORD="${hash}"`)
  })
  .catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
