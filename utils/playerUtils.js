// utils/playerUtils.js
import { db } from '../lib/db';

export async function updatePlayerStats(username, result, opponentRating) {
    console.log(`Updating stats for ${username}, result: ${result}`);
    try {
        const player = await db.player.findUnique({
            where: { username: username },
            include: { PlayerStats: true }
        });

        const currentElo = player?.PlayerStats?.elo || 1000;
        const eloChange = await calculateEloChange(currentElo, opponentRating, result);
        const newElo = currentElo + eloChange;

        const updatedPlayer = await db.player.update({
            where: { username: username },
            data: {
                PlayerStats: {
                    upsert: {
                        create: {
                            elo: newElo,
                            [result]: 1,
                            win: result === 'win' ? 1 : 0,
                            lose: result === 'lose' ? 1 : 0,
                            draw: result === 'draw' ? 1 : 0,
                        },
                        update: {
                            elo: newElo,
                            [result]: { increment: 1 },
                            win: result === 'win' ? { increment: 1 } : undefined,
                            lose: result === 'lose' ? { increment: 1 } : undefined,
                            draw: result === 'draw' ? { increment: 1 } : undefined,
                        }
                    }
                }
            },
            include: {
                PlayerStats: true
            }
        });

        console.log('Updated player stats:', updatedPlayer.PlayerStats);
        return {
            ...updatedPlayer.PlayerStats,
            eloChange: eloChange
        };
    } catch (error) {
        console.error('Error updating player stats:', error);
        throw error;
    }
}

export async function getPlayerStats(username) {
    console.log(`Fetching stats for ${username}`);
    try {
        const player = await db.player.findUnique({
            where: { username: username },
            include: { PlayerStats: true }
        });

        console.log('Fetched player stats:', player?.PlayerStats);
        return player?.PlayerStats || null;
    } catch (error) {
        console.error('Error getting player stats:', error);
        throw error;
    }
}

export async function calculateEloChange(playerRating, opponentRating, result) {
    const K = 32; // K-factor, determines the maximum change in rating
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = result === 'win' ? 1 : result === 'lose' ? 0 : 0.5;

    let eloChange = K * (actualScore - expectedScore);

    // Limit the Elo change based on the rating difference
    const ratingDifference = Math.abs(playerRating - opponentRating);
    const maxEloChange = 49 - Math.min(48, Math.floor(ratingDifference / 100));

    eloChange = Math.max(-maxEloChange, Math.min(maxEloChange, eloChange));

    return Math.round(eloChange);
}