import jwt from "jsonwebtoken";
import { findById } from "../repositories/user.repository.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: userId } = decoded;
    findById(userId).then((user) => {
      if (!user) return res.status(401).json({ message: "User not found" });
      req.user = { id: user.id, email: user.email };
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}; 