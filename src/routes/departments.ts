import express from "express";
import { departments } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await db.select().from(departments);
        return res.json({ data: result, totalCount: result.length });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
})
export default router;