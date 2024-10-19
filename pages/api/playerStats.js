import { getSession } from "next-auth/react";
import { db } from "../../lib/db"; // Ensure this path is correct

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session?.user) {
        // If no user is logged in, return default guest stats
        return res.status(200).json({
            win: 0,
            lose: 0,
            draw: 0,
            elo: 1000, // Default Elo for a guest
        });
    }

    try {
        // Fetch the player's stats for logged-in users
        const player = await db.player.findUnique({
            where: { username: session.user.username },
            include: { PlayerStats: true },
        });

        if (!player || !player.PlayerStats) {
            return res.status(404).json({ error: "Player stats not found" });
        }

        res.status(200).json(player.PlayerStats);
    } catch (error) {
        console.error("Error fetching player stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
