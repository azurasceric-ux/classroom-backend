import express from "express";
import { departments } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

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

router.post("/", async (req, res) => {
    try {
        const [createdDepartment] = await db
            .insert(departments)
            .values({
                ...req.body
            })
            .returning({ id: departments.id });

        if (!createdDepartment) {
            return res.status(400).json({ message: "Failed to create department" });
        }

        return res.status(201).json({ data: createdDepartment });
    } catch (error) {
        console.log("POST /departments error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid department ID" });
        }

        const [deletedDepartment] = await db
            .delete(departments)
            .where(eq(departments.id, id))
            .returning({ id: departments.id });

        if (!deletedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }

        return res.status(200).json({ data: deletedDepartment });
    } catch (error) {
        console.log("DELETE /departments error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid department ID" });
        }

        const [updatedDepartment] = await db
            .update(departments)
            .set({
                ...req.body
            })
            .where(eq(departments.id, id))
            .returning({ id: departments.id });

        if (!updatedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }

        return res.status(200).json({ data: updatedDepartment });
    } catch (error) {
        console.log("PUT /departments error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid department ID" });
        }

        const [updatedDepartment] = await db
            .update(departments)
            .set({
                ...req.body
            })
            .where(eq(departments.id, id))
            .returning({ id: departments.id });

        if (!updatedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }

        return res.status(200).json({ data: updatedDepartment });
    } catch (error) {
        console.log("PATCH /departments error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export default router;