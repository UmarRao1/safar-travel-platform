const fs = require("node:fs");
const bcrypt = require("bcryptjs");

const text = fs.readFileSync(".env", "utf8");
const lines = text.split(/\r?\n/);

function readEnvFile(name) {
  const found = lines.filter(line =>
    new RegExp("^\\s*" + name + "\\s*=").test(line)
  );

  if (found.length !== 1) {
    return { count: found.length, value: null };
  }

  let value = found[0].replace(/^\s*[^=]+=/, "").trim();

  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
     (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1);
  }

  return { count: found.length, value };
}

const email = readEnvFile("ADMIN_EMAIL");
const hash = readEnvFile("ADMIN_PASSWORD_HASH");
const secret = readEnvFile("ADMIN_SESSION_SECRET");

console.log({
  emailEntries: email.count,
  emailLooksValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value || ""),
  hashEntries: hash.count,
  hashBcryptFormatValid:
    /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash.value || ""),
  sessionSecretEntries: secret.count,
  sessionSecretLengthOK: (secret.value || "").length >= 32,
});
