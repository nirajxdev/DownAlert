import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      plan: user.plan,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const signup = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
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

  const user = result.rows[0];
  const token = generateToken(user);

  return {
    user,
    token,
  };
};

export const login = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    "SELECT id, email, password_hash, plan, created_at FROM users WHERE email = $1",
    [normalizedEmail]
  );
  if (result.rows.length === 0) {
    throw new Error("invalid email or password");
  }
  const user = result.rows[0];

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("invalid email or password");
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      created_at: user.created_at,
    },
    token,
  };
};

export const getUserById = async (userId) => {
  const result = await pool.query(
    "SELECT id, email, plan, created_at, updated_at FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};
