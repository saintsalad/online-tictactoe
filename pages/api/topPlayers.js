import  {db} from "../../lib/db"; 

export default async function handler(req, res) {
    try {
        // Fetch top 5 players with PlayerStats only
        const topPlayers = await db.player.findMany({
            where: {
                PlayerStats: {
                    isNot: null,  // Ensure the PlayerStats is not null
                },
            },
            select: {
                username: true,
                PlayerStats: {
                    select: {
                        elo: true,
                    }
                }
            },
            orderBy: {
                PlayerStats: {
                    elo: 'desc',
                },
            },
            take: 5, // Limit to top 5 players
        });

        if (topPlayers.length === 0) {
            return res.status(404).json({ error: "No top players found" });
        }

        res.status(200).json(topPlayers);
    } catch (error) {
        console.error("Error fetching top players:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
