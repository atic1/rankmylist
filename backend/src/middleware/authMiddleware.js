import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    console.log(`🔍 [${req.method}] ${req.originalUrl} - Auth Middleware Hit`);
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.id, ...decoded };
        console.log("✅ Token verified for:", req.user.username);
        next();
    } catch (err) {
        console.log("❌ Verification failed:", err.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default authMiddleware;
