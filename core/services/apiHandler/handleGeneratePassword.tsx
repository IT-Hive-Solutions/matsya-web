export function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*";
  const allChars = uppercase + lowercase + digits + specialChars;

  // Ensure at least one of each required character
  const passwordChars = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // Fill the rest with random characters
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the array so the first 4 characters aren't predictable
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}
