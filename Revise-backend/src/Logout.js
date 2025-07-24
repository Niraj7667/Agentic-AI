// Add this to your existing auth controller file (e.g., src/auth.js or controllers/authController.js)

export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      path: '/'
    });

    // Send success response
    res.status(200).json({ 
      message: "Logged out successfully",
      success: true 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: "Failed to logout",
      success: false 
    });
  }
};

// Alternative logout with token blacklisting (if you want extra security)
// You'd need to maintain a blacklist of tokens in Redis or database
export const logoutWithBlacklist = async (req, res) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Add token to blacklist (implement your blacklist logic here)
      // await addToBlacklist(token);
      console.log('Token added to blacklist:', token);
    }

    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.status(200).json({ 
      message: "Logged out successfully",
      success: true 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: "Failed to logout",
      success: false 
    });
  }
};