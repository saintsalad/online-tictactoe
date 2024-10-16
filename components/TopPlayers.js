import { useEffect, useState } from "react";

const TopPlayers = () => {
    const [topPlayers, setTopPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            try {
                const res = await fetch('/api/topPlayers');
                if (!res.ok) {
                    throw new Error('Failed to fetch top players');
                }
                const data = await res.json();
                setTopPlayers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopPlayers();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (topPlayers.length === 0) return <div>No top players found.</div>;

    return (
        <div className="stat-card col-span-2 w-full bg-opacity-20 bg-[#7c7c7c] p-3 rounded-md">
            <div className="text-xs mb-2">Top 5 Players</div>
            {topPlayers.map((player, index) => (
                <div key={index} className="top-player border-b text-sm my-1 px-2 py-1 rounded-sm flex justify-between">
          <span>
            <span className="font-mono mr-1">{index + 1}.</span>
              {player.username || 'Unknown'}
          </span>
                    <span className="font-medium">
            {player.PlayerStats ? `${player.PlayerStats.elo} RP` : "No stats"}
          </span>
                </div>
            ))}
        </div>
    );
};

export default TopPlayers;
