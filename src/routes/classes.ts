import express from "express";
import { db } from "../db";
import { classes } from "../db/schema";

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const [createdClass] = await db
            .insert(classes)
            .values({
                ...req.body, inviteCode: Math.random().toString(36).substring(2, 10), schedules: []
            })
            .returning({ id: classes.id });

        if (!createdClass) {
            return res.status(400).json({ message: "Failed to create class" });
        }

        return res.status(201).json(createdClass);
    } catch (error) {
        console.log("POST /classes error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
