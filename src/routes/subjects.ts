import { and, eq, getTableColumns, ilike, or, sql, desc } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

//Get all subjects with optional search and pagination
router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const sanitizedSearch = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const sanitizedDepartment = typeof department === "string" ? department.trim().slice(0, 100) : undefined;

        const currentPage = Math.max(1, Number(page) || 1);
        const limitPerPage = Math.max(1, Number(limit) || 10);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];
        // IF search exists, filter by subject name or code
        if (sanitizedSearch) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${sanitizedSearch}%`),
                    ilike(subjects.code, `%${sanitizedSearch}%`)
                )
            );
        }
        // IF department exists, filter by department
        if (sanitizedDepartment) {
            filterConditions.push(
                ilike(departments.name, `%${department}%`)
            );
        }
        // Combine all filter conditions
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.
            select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);


        const totalCount = Number(countResult[0]?.count ?? 0);

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                totalCount,
                currentPage,
                limitPerPage,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch subjects" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid subject ID" });
        }

        const subjectResult = await db.
            select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, id));

        if (!subjectResult) {
            return res.status(404).json({ message: "Subject not found" });
        }

        res.status(200).json({
            data: subjectResult[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch subjects" });
    }
});

router.post("/", async (req, res) => {
    try {
        const createdSubject = await db
            .insert(subjects)
            .values({
                ...req.body
            })
            .returning({ id: subjects.id });

        if (!createdSubject) {
            return res.status(400).json({ message: "Failed to create subject" });
        }

        return res.status(201).json({ data: createdSubject });
    } catch (error) {
        console.log("POST /subjects error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid subject ID" });
        }

        const deletedSubject = await db
            .delete(subjects)
            .where(eq(subjects.id, id))
            .returning({ id: subjects.id });

        if (!deletedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({ data: deletedSubject[0] });
    } catch (error) {
        console.log("DELETE /subjects error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid subject ID" });
        }

        const updatedSubject = await db
            .update(subjects)
            .set({
                ...req.body
            })
            .where(eq(subjects.id, id))
            .returning({ id: subjects.id });

        if (!updatedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({ data: updatedSubject[0] });
    } catch (error) {
        console.log("PUT /subjects error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid subject ID" });
        }

        const updatedSubject = await db
            .update(subjects)
            .set({
                ...req.body
            })
            .where(eq(subjects.id, id))
            .returning({ id: subjects.id });

        if (!updatedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({ data: updatedSubject[0] });
    } catch (error) {
        console.log("PUT /subjects error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
export default router;