import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import GameResultModal from '../components/GameResultModal';
import GameStartIntroModal from "../components/GameStartIntroModal";

export default function Home() {

  const END_POINT = "http://localhost:3001"

  const TIMER_SECS = 5;
  const [socket, setSocket] = useState(null);
  const [myRoom, setMyRoom] = useState('');
  const [myName, setMyName] = useState('me');
  const [oppName, setOppName] = useState('unknown');
  const [isHost, setIsHost] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [moves, setMoves] = useState(['', '', '', '', '', '', '', '', '']);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isMatchDone, setIsMatchDone] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECS);
  const [openIntroModal, setIntroModal] = useState(false);
  const [resultModalDesc, setResultModalDesc] = useState('');

  useEffect(() => {
    // setSocket(io(END_POINT).emit("wassap", "wassap"));

    fetch('/api/socketio').finally(() => {
      const socket = io('/', { transports: ['websocket'], upgrade: false });
      setSocket(socket);
    });

    getPlayerName();

  }, []);

  const getPlayerName = () => {
    // const name = prompt('Please enter you name');
    // setMyName(name ? name : 'Someone');
    setMyName('someone')
  }

  useEffect(() => {

    if (socket) {
      socket.on("connect", () => {
        console.log('connected :', socket.connected); // true
      });

      socket.on('joined-room', (d) => {
        setMyRoom(d.room)
        setSymbol(d.isHost ? 'x' : 'circle');
        setIsMyTurn(d.isHost);
        setOppName(d.name);
        setIsHost(d.isHost);

        if (d.isHost) {
          setIsReady(d.isReady);
        } else {
          setIntroModal(true);
          setTimeout(() => {
            setIsReady(d.isReady);
            setIntroModal(false);
          }, 5000);

        }

      });

      // socket.on('game-ready', (d) => {
      //   console.log('ready');
      //   setOppName(d.name);

      //   setIntroModal(true);
      //   setTimeout(() => {
      //     setIsReady(d.isReady);
      //     setIntroModal(false);
      //   }, 5000);

      // });

      socket.on('move', (d) => {
        setIsMyTurn(d.turn === symbol ? false : true);
        setMoves(d.moves);
      });
    }
  }, [socket, symbol]);

  // For Game Ready Event
  useEffect(() => {
    const callback = (d) => {
      console.log('ready')
      setOppName(d.name);
      setIntroModal(true);
      setTimeout(() => {
        setIsReady(d.isReady);
        setIntroModal(false);
      }, 5000);
    }

    if (socket) {
      socket.on('game-ready', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('game-ready', () => {
          console.log('clean')
        })
      }
    }
  }, [socket]);

  // For Times Up Event
  useEffect(() => {
    let myInterval = null;
    if (isReady && isMyTurn) {
      myInterval = setInterval(() => {
        if (timer === 0) {
          clearInterval(myInterval);

          socket.emit('times-up',
            { symbol: symbol, room: myRoom });

        } else if (isMatchDone) {
          clearInterval(myInterval);
          setTimer(TIMER_SECS);
        } else {
          setTimer(timer - 1);
        }

      }, 1000);
    } else if (isReady && !isMyTurn) {
      setTimer(TIMER_SECS);
    }

    return () => clearInterval(myInterval);
  }, [timer, isReady, isMyTurn, isMatchDone])

  // Game Result Event
  useEffect(() => {
    const callback = (d) => {
      if (d.result === 'done' && symbol) {
        console.log(d.result);
        for (let index = 0; index < d.combination.length; index++) {
          const el = document.getElementById('cell' + d.combination[index]);
          el.classList.add(d.winner == symbol ? 'win' : 'lose');
        }
        setTimeout(() => {
          setIsWin(d.winner == symbol ? true : false);
          setIsMatchDone(true);
        }, 1500);

      } else if (d.result === 'draw') {
        console.log(d.result);

        setTimeout(() => {
          setIsWin(null);
          setIsMatchDone(true);
        }, 1000);
      } else if (d.result === 'timesup' && symbol) {
        console.log(d.result);

        setTimeout(() => {
          setIsWin(d.winner == symbol ? true : false);
          setIsMatchDone(true);
        }, 1000);
      }
    }

    if (socket) {
      socket.on('game-result', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('game-result');
      }
    }

  }, [socket, symbol])

  const handleJoinRoom = () => {
    if (socket.connected) {
      socket.emit('join-room', { id: socket.id, name: myName });
    }
  }

  useEffect(() => {
    const callback = () => {
      const m = [...moves];
      let movesMade = 0;
      for (let i = 0; i < m.length; i++) {

        if (m[i] !== '') {
          movesMade = movesMade + 1;
        }

        if (i === 8) {
          if (movesMade >= 3) {
            setResultModalDesc('Your opponent leave the match.');
            setIsWin(true);
            setIsMatchDone(true);

          } else if (movesMade <= 0) {
            setResultModalDesc('Your opponent leave the match.');
            setIsWin(null);
            setIsMatchDone(true);
          }
        }

      }
    }

    if (socket) {
      socket.on('enemy-disconnect', callback);
    }

    return () => {
      if (socket) {
        socket.off('enemy-disconnect', callback);
        setResultModalDesc('');
      }
    }

  }, [socket, moves]);

  const handleCellClick = (i) => {
    let m = [...moves];
    if (m[i] === '') {
      setIsMyTurn(false);
      m[i] = symbol;
      setMoves(m);
      socket.emit('move', {
        room: myRoom,
        moves: m,
        turn: symbol
      });
    }

  }

  const resetGame = () => {
    setIsReady(false);
    setMyRoom('');
    setIsHost(null);
    // setIsMatchDone(false);
  }

  const handleResultModalExit = () => {
    console.log('exit');
  }

  const handleResultModalPlayAgain = () => {
    console.log('play again');
  }


  return (
    <div className="app">
      <GameStartIntroModal open={openIntroModal}></GameStartIntroModal>
      <GameResultModal modalDesc={resultModalDesc} clickExit={handleResultModalExit}
        clickPlayAgain={handleResultModalPlayAgain}
        open={isMatchDone} win={isWin}></GameResultModal>
      {isHost !== null &&
        (
          <small>
            {/* <p>Symbol: {symbol}</p>
            <p>Socket Id: {socket.id}</p>
            <p>{isHost === true ? 'Hosted' : 'Joined'} : {myRoom}</p> */}
            <p>name: {myName}</p>
            <p>opp: {oppName}</p>
            <p>timer: {timer}</p>
          </small>

        )}
      {/* <button onClick={resetGame}>Reset</button> */}

      {(!isReady && myRoom === '') &&
        (<div className="flex w-full p-5">
          <button
            className="rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleJoinRoom}>Find match</button>
        </div>)
      }
      <hr></hr>
      {isReady && (
        <div style={{ pointerEvents: (isMyTurn ? 'auto' : 'none') }}
          className={'board ' + (isMyTurn ? symbol : '')} id='board'>
          {moves.map((cell, i) => (
            <div className={'cell ' + cell}
              onClick={() => handleCellClick(i)} data-cell
              key={i + cell} index={i} id={'cell' + i}> </div>
          ))}
        </div>
      )}
    </div>
  )
}
