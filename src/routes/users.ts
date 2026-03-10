import { and, eq, getTableColumns, ilike, or, sql, desc } from "drizzle-orm";
import express from "express";
import { users } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Get all users with optional search and pagination
router.get("/", async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const sanitizedSearch = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const sanitizedRole = typeof role === "string" ? role.trim().slice(0, 50) : undefined;

        const currentPage = Math.max(1, Number(page) || 1);
        const limitPerPage = Math.max(1, Number(limit) || 10);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];
        // IF search exists, filter by user name or email
        if (sanitizedSearch) {
            filterConditions.push(
                or(
                    ilike(users.name, `%${sanitizedSearch}%`),
                    ilike(users.email, `%${sanitizedSearch}%`)
                )
            );
        }

        // IF role exists, filter by role
        if (sanitizedRole) {
            // Need to cast to any or infer enum since role is a pgEnum
            filterConditions.push(eq(users.role, sanitizedRole as any));
        }

        // Combine all filter conditions
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereClause);

        const totalCount = Number(countResult[0]?.count ?? 0);

        const usersList = await db
            .select(getTableColumns(users))
            .from(users)
            .where(whereClause)
            .orderBy(desc(users.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                totalCount,
                currentPage,
                limitPerPage,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

export default router;