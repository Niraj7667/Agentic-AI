import express from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d", // Same as signup token expiry
    }
  );
};

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please signup first." });
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Generate access token
    const token = generateAccessToken(user);

    // ✅ Set token in HttpOnly cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "None", // Allows cross-origin cookies
      secure: true,     // Required for HTTPS domains
    });

    console.log("✅ Login token:", token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error during login" });
  }
};
