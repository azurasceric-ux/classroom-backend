import { NextFunction, Request, Response } from "express";
import aj from "../config/arcjet";
import { ArcjetNodeRequest, ArcjetRequest, slidingWindow } from "@arcjet/node";
const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "test") return next();
    if (!aj) {
        return res.status(500).json({ error: "Internal server error.", message: "ArcJet client is not configured." });
    }
    try {
        const role: RateLimitRole = req.user?.role ?? "guest";
        let limit: number;
        let message: string;
        switch (role) {
            case "admin":
                limit = 20;
                message = "Admin rate limit exceeded.";
                break;
            case "teacher":
                limit = 10;
                message = "Teacher rate limit exceeded.";
                break;
            case "student":
                limit = 10;
                message = "Student rate limit exceeded.";
                break;
            default:
                limit = 5;
                message = "Guest rate limit exceeded.";
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval: "60s",
                max: limit,
            })
        );

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: { remoteAddress: req.ip ?? req.socket.remoteAddress ?? "0.0.0.0" }
        }

        const decision = await client.protect(arcjetRequest);

        if (decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({ error: "Forbidden.", message: "You are a bot." });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({ error: "Forbidden.", message: "Request blocked by security policy." });
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(429).json({ error: "Too many requests.", message });
        }

        next();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error.", message: "Something went wrong with security middleware." });
    }
}

export default securityMiddleware;