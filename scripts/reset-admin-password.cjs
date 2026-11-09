const bcrypt = require("bcryptjs");
const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter your NEW Safar admin password: ", async (password) => {
  try {
    if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
      throw new Error("Use at least 12 characters and no more than 72 UTF-8 bytes.");
    }

    const hash = await bcrypt.hash(password, 12);
    console.log("\nGenerated bcrypt hash (keep it private):");
    console.log(hash);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    password = "";
    rl.close();
  }
});
