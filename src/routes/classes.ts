import express from "express";
import { db } from "../db";
import { classes, departments, subjects, users } from "../db/schema";
import { and, eq, getTableColumns, ilike, or, sql, desc } from "drizzle-orm";

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

        return res.status(201).json({ data: createdClass });
    } catch (error) {
        console.log("POST /classes error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/', async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit = 10 } = req.query;

        const sanitizedSearch = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const sanitizedSubject = typeof subject === "string" ? subject.trim().slice(0, 100) : undefined;
        const sanitizedTeacher = typeof teacher === "string" ? teacher.trim().slice(0, 100) : undefined;

        const currentPage = Math.max(1, Number(page) || 1);
        const currentLimit = Math.max(1, Number(limit) || 10);

        const offset = (currentPage - 1) * currentLimit;

        const escapeLikePattern = (value: string) => value.replace(/[%_]/g, (char) => `\\${char}`);

        const filterConditions = [];
        if (sanitizedSearch) {
            filterConditions.push(
                ilike(classes.name, `%${escapeLikePattern(sanitizedSearch)}%`)
            );
        }
        if (sanitizedSubject) {
            filterConditions.push(
                ilike(subjects.name, `%${escapeLikePattern(sanitizedSubject)}%`)
            );
        }
        if (sanitizedTeacher) {
            filterConditions.push(
                ilike(users.name, `%${escapeLikePattern(sanitizedTeacher)}%`)
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.
            select({ count: sql<number>`count(*)` })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(users, eq(classes.teacherId, users.id))
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count ?? 0);

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: { ...getTableColumns(subjects) },
                teacher: {
                    id: users.id,
                    name: users.name
                }
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(users, eq(classes.teacherId, users.id))
            .where(whereClause)
            .orderBy(desc(classes.createdAt))
            .offset(offset)
            .limit(currentLimit);

        return res.status(200).json({
            data: classesList,
            pagination: {
                totalCount,
                currentPage,
                limitPerPage: currentLimit,
                totalPages: Math.ceil(totalCount / currentLimit),
            },
        });
    } catch (error) {
        console.log("GET /classes error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        const classData = await db
            .select({
                ...getTableColumns(classes),
                subject: { ...getTableColumns(subjects) },
                department: { ...getTableColumns(departments) },
                teacher: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(users, eq(classes.teacherId, users.id))
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(classes.id, id));

        if (classData.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }
        return res.status(200).json({
            data: classData[0]
        });
    } catch (error) {
        console.log("GET /classes/:id error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        const classData = await db
            .delete(classes)
            .where(eq(classes.id, id))
            .returning({ id: classes.id });

        if (classData.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }
        return res.status(200).json({
            data: classData[0]
        });
    } catch (error) {
        console.log("DELETE /classes/:id error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.patch('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        if (!Object.keys(req.body).length) {
            return res.status(400).json({ message: "No fields provided to update" });
        }
        const classData = await db
            .update(classes)
            .set(req.body)
            .where(eq(classes.id, id))
            .returning({ id: classes.id });

        if (classData.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }
        return res.status(200).json({
            data: classData[0]
        });
    } catch (error) {
        console.log("PATCH /classes/:id error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        const classData = await db
            .update(classes)
            .set(req.body)
            .where(eq(classes.id, id))
            .returning({ id: classes.id });

        if (classData.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }
        return res.status(200).json({
            data: classData[0]
        });
    } catch (error) {
        console.log("PUT /classes/edit/:id error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
export default router;
