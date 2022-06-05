import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import AlertModal from "../components/AlertModal";
import GameResultModal from '../components/GameResultModal';
import GameStartIntroModal from "../components/GameStartIntroModal";
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router from "next/router";
import AnimatePage from '../components/AnimatePage';

export default function Home() {

  const DEFAULT_MOVES = ['', '', '', '', '', '', '', '', ''];
  const TIMER_SECS = 5;
  const [socket, setSocket] = useState(null);
  const [myRoom, setMyRoom] = useState('');
  const [myName, setMyName] = useState('me');
  const [oppName, setOppName] = useState('unknown');
  const [isHost, setIsHost] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [moves, setMoves] = useState(DEFAULT_MOVES);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isMatchDone, setIsMatchDone] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECS);
  const [openIntroModal, setIntroModal] = useState(false);
  const [resultModalDesc, setResultModalDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRematch, setIsRematch] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const mySetTimeout = useRef(setTimeout);
  const [myWins, setMyWins] = useState(0);
  const [myLoses, setMyLoses] = useState(0);

  useEffect(() => {
    const getPlayerName = () => {
      if (typeof getFromStorage('player-name') === 'undefined' ||
        getFromStorage('player-name') === null ||
        getFromStorage('player-name') === '') {
        Router.push('/signin');


        // const name = prompt('Please enter you name');
        // if (!name.replace(/\s/g, '').length || name === '') {
        //   getPlayerName();
        // } else {
        //   setToStorage('player-name', name);
        //   setMyName(name);
        // }
      } else {
        setMyName(getFromStorage('player-name'));
      }
    }

    fetch('/api/socketio').finally(() => {
      const socket = io();
      setSocket(socket);
    });

    getPlayerName();
  }, []);


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
          setIsLoading(true);
          setIsReady(d.isReady);
        } else {
          setIsLoading(false);
          setIntroModal(true);
          mySetTimeout.current = setTimeout(() => {
            setIsReady(d.isReady);
            setIntroModal(false);
          }, 5000);

        }
      });

      socket.on('move', (d) => {
        setIsMyTurn(d.turn === symbol ? false : true);
        setMoves(d.moves);
      });

    }
  }, [socket, symbol]);

  // For Game Ready Event
  useEffect(() => {
    const callback = (d) => {
      setIsLoading(false);
      setOppName(d.name);
      setIntroModal(true);
      if (isRematch) {
        setTimer(TIMER_SECS);
        setIsRematch(false);
      }
      mySetTimeout.current = setTimeout(() => {
        setIsReady(d.isReady);
        setIntroModal(false);
      }, 5000);
    }

    if (socket) {
      socket.on('game-ready', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('game-ready', callback);
      }
    }
  }, [socket, isRematch, isLoading]);

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
  }, [timer, isReady, isMyTurn, isMatchDone, myRoom, socket, symbol])

  // Game Result Event
  useEffect(() => {
    const callback = (d) => {
      if (d.result === 'done' && symbol) {
        for (let index = 0; index < d.combination.length; index++) {
          const el = document.getElementById('cell' + d.combination[index]);
          el.classList.add(d.winner == symbol ? 'win' : 'lose');
        }
        setTimeout(() => {
          const iWin = d.winner == symbol ? true : false;
          setIsWin(iWin);
          if (iWin) {
            setMyWins(w => w + 1);
          } else {
            setMyLoses(l => l + 1)
          }
          setIsMatchDone(true);
        }, 1000);

      } else if (d.result === 'draw') {
        setTimeout(() => {
          setIsWin(null);
          setIsMatchDone(true);
        }, 500);
      } else if (d.result === 'timesup' && symbol) {

        setTimeout(() => {
          setIsWin(d.winner == symbol ? true : false);
          setIsMatchDone(true);
        }, 500);
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

  // Disconnect Event
  useEffect(() => {
    const callback = () => {
      const m = [...moves];
      let movesMade = 0;
      for (let i = 0; i < m.length; i++) {

        if (m[i] !== '') {
          movesMade = movesMade + 1;
        }

        if (i === 8) {
          const desc = 'Your opponent is disconnected.';
          console.log(desc);
          clearTimeout(mySetTimeout.current);
          setTimer(TIMER_SECS);
          setIntroModal(false);
          setIsReady(false);

          if (isMatchDone) {
            setIsMatchDone(false);
            setOpenAlertModal(true);
          } else {
            if (movesMade >= 3) {
              setIsWin(true);
              setIsMatchDone(true);
            } else {
              setIsWin(null);
              setIsMatchDone(true);
              // setOpenAlertModal(true);
            }
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

  }, [socket, moves, isMatchDone, isWin, resultModalDesc]);

  // Opp wants rematch event
  useEffect(() => {

    const callback = () => {
      setIsRematch(true);
    }

    if (socket) {
      socket.on('rematch', () => callback());
    }

    return () => {
      if (socket) {
        socket.off('rematch');
      }
    }

  }, [socket, isRematch]);

  // Opp exit the match event
  useEffect(() => {
    const callback = () => {
      setOpenAlertModal(true);
      setIsMatchDone(false);
      setIsReady(false);
    }

    if (socket) {
      socket.on('exit-room', () => callback());
    }

    return () => {
      if (socket) {
        socket.off('exit-room', () => callback());
      }
    };

  }, [socket, openAlertModal]);

  const handleJoinRoom = (isPlayAgain = false) => {
    if (socket.connected) {

      if (isPlayAgain) {
        setIsMatchDone(false);
        socket.emit('join-room', { id: socket.id, name: myName, room: myRoom });
      } else {
        socket.emit('join-room', { id: socket.id, name: myName, room: '' });
      }
    }
  }

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

  const handleResultModalExit = () => {
    clearTimeout(mySetTimeout.current);
    setIsReady(false);
    setIsMatchDone(false);
    setIsLoading(true);
    socket.emit('exit-room', { room: myRoom }, (res) => {
      if (res.status === 'ok') {
        setMyRoom('');
        setIsHost(null);
        setMoves(DEFAULT_MOVES);
        setOppName('');
        setSymbol('');
        setTimer(TIMER_SECS);
        setIntroModal(false);
        setResultModalDesc('');
        setIsWin(null);
        setIsLoading(false);
        setOpenAlertModal(false);
      }
    })
  }

  const handleResultModalPlayAgain = () => {
    if (resultModalDesc === '') {
      socket.emit('rematch',
        {
          room: myRoom,
          acceptRematch: isRematch
        }, (res) => {
          if (res.status === 'ok') {
            setIsMatchDone(false);
            setIsReady(false);
            setIsLoading(!isRematch ? true : false);
            setMoves(DEFAULT_MOVES);
            // setIsMyTurn(false);
            // setSymbol('');
          }
        });
    } else {
      if (isHost) {
        clearTimeout(mySetTimeout.current);
        setIsLoading(true);
        setIsReady(false);
        setMoves(DEFAULT_MOVES);
        setIsMatchDone(false);
        setTimer(TIMER_SECS);
        setOppName('');
        setIsWin(null);
        setIntroModal(false);
      } else {
        handleJoinRoom(true);
      }
    }

  }


  return (
    <AnimatePage>
      <div className="app font-sans">
        <GameStartIntroModal open={openIntroModal}></GameStartIntroModal>
        <GameResultModal clickExit={handleResultModalExit}
          clickPlayAgain={handleResultModalPlayAgain} modalDesc={resultModalDesc}
          open={isMatchDone} win={isWin}></GameResultModal>
        <AlertModal open={openAlertModal} clickExit={handleResultModalExit}></AlertModal>

        <div className="max-w-4xl mx-auto">
          {isHost !== null &&
            (
              <div className="absolute">
                {/* <p>Symbol: {symbol}</p>
            <p>Socket Id: {socket.id}</p>
            <p>{isHost === true ? 'Hosted' : 'Joined'} : {myRoom}</p> */}
                {/* 
            <p>opp: {oppName} | isReady {isReady ? 'true' : 'false'}</p>
            <p>timer: {timer} | isRematch: {isRematch ? 'true' : 'false'}</p>
            <p>{isMyTurn ? 'Your Turn...' : 'Enemy Turn...'} | isLoading: {isLoading ? 'true' : 'false'}</p> */}
                <p>Name: {myName} | Symbol: {symbol}</p>
                <p>Opponent: {oppName} </p>
                <p>Wins: {myWins} | Loses: {myLoses}</p>
                <p>Timer: {timer}</p>
                <p>{isMyTurn ? 'Your Turn...' : 'Enemy Turn...'} </p>
              </div>

            )}
          {/* <button onClick={resetGame}>Reset</button> */}

          {(!isReady && myRoom === '') &&
            (<div className="flex w-full p-5">
              <button disabled={!socket}
                id="findMatchBtn"
                className="rounded-full border-0 shadow-sm px-10 py-3 bg-gradient-to-t from-[#746BFA] to-[#AFACFA] text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-0 focus:ring-offset-4 focus:ring-offset-transparent sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleJoinRoom}>Find Match</button>
            </div>)
          }
          {(isReady && !isLoading && myRoom !== '') && (
            <div style={{ pointerEvents: (isMyTurn ? 'auto' : 'none') }}
              className={'board ' + (isMyTurn ? symbol : '')} id='board'>
              {moves.map((cell, i) => (
                <div className={'cell ' + cell}
                  onClick={() => handleCellClick(i)} data-cell
                  key={i + cell} index={i} id={'cell' + i}> </div>
              ))}
            </div>
          )}
          {(!isReady && isLoading) && (
            <div className="justify-center flex items-center h-screen relative">
              <span className="loader"></span>
            </div>
          )}
        </div>
      </div>
    </AnimatePage>
  )
}
