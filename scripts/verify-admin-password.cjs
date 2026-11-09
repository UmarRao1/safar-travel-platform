const bcrypt = require("bcryptjs");

(async () => {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const password = process.env.SAFAR_TEST_PASSWORD;

  const validFormat =
    /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash || "");

  let matches = false;

  if (validFormat && password) {
    matches = await bcrypt.compare(password, hash);
  }

  console.log({
    hashPresent: Boolean(hash),
    bcryptFormatValid: validFormat,
    passwordMatchesCurrentHash: matches,
  });
})().catch(() => {
  console.log("Verification failed. Check the local project configuration.");
  process.exitCode = 1;
});
