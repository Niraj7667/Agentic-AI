import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {

  const token = req.cookies.access_token;
  console.log("token" , token);
  if (!token) {
    req.user = null;
    return res.status(401).json({ message: "Not authenticated" }); // ✅ make sure to respond
  }
  console.log("abcd");
  console.log("JWT_SECRET in verifyAuth:", process.env.JWT_SECRET);

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    console.log(req.user);
    console.log("abcde");
    return next(); // ✅ this is required
  } catch (error) {
    req.user = null;
    return res.status(401).json({ message: "Invalid or expired token" }); // ✅ respond on failure
  }
};
