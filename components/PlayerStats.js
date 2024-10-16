import { useEffect, useState } from 'react';
import TopPlayers from "./TopPlayers";

const PlayerStats = () => {
    const [playerStats, setPlayerStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlayerStats = async () => {
            try {
                const res = await fetch('/api/playerStats');
                if (!res.ok) {
                    throw new Error('Failed to fetch player stats');
                }
                const data = await res.json();
                setPlayerStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerStats();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!playerStats) return <div>No stats available.</div>;

    const totalMatches = (playerStats.win || 0) + (playerStats.lose || 0) + (playerStats.draw || 0);
    const winRate = totalMatches > 0
        ? ((playerStats.win || 0) + 0.5 * (playerStats.draw || 0)) / totalMatches * 100
        : 0;

    return (
        <div className="grid gap-4 grid-cols-2">
            <div className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#EA0599] p-3 rounded-md h-20 max-w-full">
                <div className="text-xs">Total Matches</div>
                <div className="font-semibold text-2xl">{totalMatches}</div>
            </div>

            <div className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#9A0F98] p-3 rounded-md h-20 max-w-full">
                <div className="text-xs">Win Rate</div>
                <div className="font-semibold text-xl">{winRate.toFixed(2)}%</div>
            </div>

            <div className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#6A0572] p-3 rounded-md h-20 max-w-full">
                <div className="text-xs">Draws</div>
                <div className="font-semibold text-2xl">{playerStats.draw || 0}</div>
            </div>

            <div className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#39065A] p-3 rounded-md h-20 max-w-full">
                <div className="text-xs">Loses</div>
                <div className="font-semibold text-2xl">{playerStats.lose || 0}</div>
            </div>

            <div className="col-span-2 w-full bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#FC585D] p-3 rounded-md h-20 max-w-full">
                <div className="text-xs">Rank Points (Elo)</div>
                <div className="font-semibold text-2xl text-right">{playerStats.elo || 1000}</div>
            </div>
            <TopPlayers/>
        </div>
    );
};

export default PlayerStats;
