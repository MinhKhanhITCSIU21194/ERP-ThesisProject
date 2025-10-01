const bcrypt = require("bcryptjs");

const passwords = ["AdminPass123!", "Password123!", "UserPass123!"];

async function generateHashes() {
  console.log("Generated password hashes:");
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`Password: ${password} -> Hash: ${hash}`);
  }
}

generateHashes().catch(console.error);
