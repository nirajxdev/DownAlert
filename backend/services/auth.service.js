import bcrypt from "bcrypt";
import pool from "../db/index.js";

export const signup = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1", [normalizedEmail]
  );
  if (existingUser.rows.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, plan, created_at
    `,
    [normalizedEmail, passwordHash]
  );
  return result.rows[0];
};

export default signup;
