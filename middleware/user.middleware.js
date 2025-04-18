import jwt from 'jsonwebtoken';
import { User } from '../postgreSql.js';

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required (Bearer token)"
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found - token invalid"
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                code: "TOKEN_EXPIRED"
            });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
                code: "INVALID_TOKEN"
            });
        }

        console.error("Authentication error:", error);
        res.status(500).json({
            success: false,
            message: "Internal authentication error"
        });
    }
};


const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            code: 401,
            message: "Authentication required - no user data found"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            code: 403,
            message: "Admin privileges required"
        });
    }
    next();
};

export { authenticate, authorizeAdmin };
