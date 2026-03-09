import arcjet, { detectBot, shield, slidingWindow, tokenBucket } from "@arcjet/node";

if (!process.env.ARCJET_KEY && process.env.NODE_ENV !== 'test') {
    throw new Error("ARCJET_KEY is not defined");
}

const aj = arcjet({
    // Get your site key from https://app.arcjet.com and set it as an environment
    // variable rather than hard coding.
    key: process.env.ARCJET_KEY!,
    rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
            // Block all bots except the following
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
            ],
        }),
        slidingWindow({
            mode: "LIVE",
            interval: 5, // 5 seconds
            max: 5, // 5 requests per interval
        }),
    ],
});

export default aj;