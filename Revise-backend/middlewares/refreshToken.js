// Refresh Token Handler
export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      return res.status(401).json({ message: "Refresh token not provided" });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: {
        sessionId: refresh_token,
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.valid || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(session.user);

    // Set new access token in cookie
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    console.log("✅ New access token generated:", newAccessToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};