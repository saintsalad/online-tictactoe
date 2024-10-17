import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

const db = new PrismaClient();

const userSchema = z.object({
    username: z.string().min(1, "Username is required").max(20),
    password: z.string().min(1, "Password is required").min(8, "Password must have more than 8 characters"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const body = req.body;
        const { username, password } = userSchema.parse(body);

        // Check if user exists
        const existedUser = await db.player.findUnique({
            where: {username},
        });

        if (existedUser) {
            return res.status(409).json({ user: null, message: "This user already exists" });
        }

        // Create new user
        const newUser = await db.player.create({
            data: {
                username,
                password,
                PlayerStats: {
                    create: {
                        elo: 1000,
                        win: 0,
                        lose: 0,
                        draw: 0,
                    },
                },
            },
        });

        const { password: newUserPassword, ...rest } = newUser;
        return res.status(201).json({ user: rest, message: "User created" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong!" });
    }
}