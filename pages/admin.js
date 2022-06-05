/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function admin() {

    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [activeRooms, setActiveRooms] = useState([]);

    useEffect(() => {
        // setSocket(io(END_POINT).emit("wassap", "wassap"));

        fetch('/api/socketio').finally(() => {
            const socket = io();
            setSocket(socket);
        });

    }, []);

    useEffect(() => {

        const callback = (d) => {
            setRooms(d.rooms);
            setActiveRooms(d.activeRooms);
            console.log('called')
        }

        if (socket) {
            socket.on('admin-rooms', (d) => callback(d));

        }

        return () => {
            if (socket) {
                socket.off('admin-rooms');
            }
        }

    }, [socket, rooms]);


    return (
        <>
            <div>admin</div>
            <p>Rooms: {JSON.stringify(rooms)}</p>
            <p>Active Rooms: {JSON.stringify(activeRooms)}</p>
        </>
    )
}