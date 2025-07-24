import express from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken"; // Make sure to import jwt

const prisma = new PrismaClient();

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await argon2.hash(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // ✅ Create token after signup
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // ✅ Set token in HttpOnly cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false, // Set to true in production with HTTPS
    });

    console.log("✅ Signup token:", token);

    return res.status(201).json({
      message: "User created & authenticated successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error during signup" });
  }
};
