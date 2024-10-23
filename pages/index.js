import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import AlertModal from "../components/AlertModal";
import GameResultModal from '../components/GameResultModal';
import GameStartIntroModal from "../components/GameStartIntroModal";
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router, { useRouter } from "next/router";
import AnimatePage from '../components/AnimatePage';
import TimerBar from "../components/TimerBar";
import useNoInitialEffect from "../helper/UseNoInitialEffect";
import {signOut, useSession} from "next-auth/react";
import PlayerStats from "../components/PlayerStats";
import {getPlayerStats, updateBothPlayersStats, updatePlayerStats} from '../utils/playerUtils';
import TopPlayers from "../components/TopPlayers";

export default function Home() { 
  const { data: session,status } = useSession()
  const userName = session?.user?.username || 'Guest';
  
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [guestId, setGuestId] = useState('');
  const [locationKeys, setLocationKeys] = useState([]);

  const DEFAULT_MOVES = useRef(['', '', '', '', '', '', '', '', '']);
  const TIMER_SECS = 15.0;
  const [socket, setSocket] = useState(null);
  const [myRoom, setMyRoom] = useState('');
  const [oppName, setOppName] = useState('unknown');
  const [isHost, setIsHost] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [moves, setMoves] = useState(DEFAULT_MOVES.current);
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
  const [enemyTimer, setEnemyTimer] = useState(TIMER_SECS);
  const [pauseMyInterval, setPauseMyInterval] = useState(false);
  const [matchScore, setMatchScore] = useState({
    me: 0, enemy: 0
  });
  const didMount = useRef(false);

  useEffect(() => {

    didMount.current = true;

    fetch('/api/socketio').finally(() => {
      const s = io();
      setSocket(s);
    });

    // Broadcast that you're opening a page.
    localStorage.openpages = Date.now();
    window.addEventListener('storage', function (e) {
      if (e.key == "openpages") {
        // Listen if anybody else is opening the same page!
        localStorage.page_available = Date.now();
      }
      if (e.key == "page_available") {
        Router.push('/admonition');
      }
    }, false);

    //getPlayerName();
  }, []);



  // Move
  useEffect(() => {

    const callback = (d) => {
      setPauseMyInterval(false);
      setIsMyTurn(d.turn === symbol ? false : true);
      setMoves(d.moves);
    }

    if (socket) {
      socket.on('move', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('move', (d) => callback(d));
      }
    }
  }, [socket, symbol]);


  // Join Room 
  useEffect(() => {

    const callback = (d) => {
      setMyRoom(d.room)
      setSymbol(d.isHost ? 'x' : 'circle');
      setIsMyTurn(d.isHost);
      if (!isRematch) {
        setOppName(d.name);
      }

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
    }

    if (socket) {
      socket.on('joined-room', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('joined-room', (d) => callbackJoinedRoom(d));
      }
    }

  }, [socket, isRematch]);

  // For Game Ready Event
  useEffect(() => {
    const callback = (d) => {
      setPauseMyInterval(false)
      setIsLoading(false);

      setIntroModal(true);
      if (isRematch) {
        setTimer(TIMER_SECS);
        setIsRematch(false);
      } else {
        setOppName(d.name ? d.name : oppName);
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
        socket.off('game-ready', (d) => callback(d));
      }
    }
  }, [socket, isRematch, isLoading, oppName]);

  // For Times Up Event
  useEffect(() => {
    let myInterval = null;
    if (isReady && isMyTurn) {

      if (timer <= 0) {
        clearInterval(myInterval);
        socket.emit('times-up',
          { symbol: symbol, room: myRoom });

      } else {
        if (!pauseMyInterval) {
          myInterval = setInterval(() => {
            if (isMatchDone) {
              clearInterval(myInterval);
              // setTimer(TIMER_SECS);
            } else {
              const t = parseFloat((timer - 0.1).toFixed(4));
              setTimer(t);
              socket.emit('enemy-timer', {
                room: myRoom,
                timer: t
              });
            }

          }, 100);
        }

      }

    } else if (isReady && !isMyTurn) {
      // setTimer(TIMER_SECS);
    }

    return () => clearInterval(myInterval);
  }, [timer, isReady, isMyTurn, isMatchDone, myRoom, socket, symbol, pauseMyInterval])
  
  // Game Result Event
  useEffect(() => {
    const callback = async (d) => {
      if ((d.result === 'done' || d.result === 'draw' || d.result === 'timesup') && symbol) {
        const iWin = d.result === 'draw' ? null : d.winner === symbol;

        setTimeout(async () => {
          setIsWin(iWin);
          setIsMatchDone(true);

          let result;
          if (iWin === true) {
            result = 'win';
            setMatchScore(prevState => ({
              me: prevState.me + 1,
              enemy: prevState.enemy
            }));
          } else if (iWin === false) {
            result = 'lose';
            setMatchScore(prevState => ({
              me: prevState.me,
              enemy: prevState.enemy + 1
            }));
          } else {
            result = 'draw';
          }

          // Only the winner or the host (in case of a draw) should update
          if (iWin || (isHost && iWin === null)) {
            socket.emit('update-game-result', {
              room: myRoom,
              player1: {
                username: session?.user?.username || guestId,
                isGuest: !session?.user,
                result: result
              },
              player2: {
                username: oppName || 'unknown',
                isGuest: oppName === 'unknown',
                result: result === 'win' ? 'lose' : (result === 'lose' ? 'win' : 'draw')
              }
            });

            console.log('Sent game result to server');
          }
        }, 200);

        // Visual updates for 'done' result
        if (d.result === 'done') {
          for (let i = 0; i < 9; i++) {
            const el = document.getElementById('cell' + i);
            el.classList.add('lose');
            for (let j = 0; j < d.combination?.length || 0; j++) {
              if (i === d.combination[j]) {
                el.classList.remove('lose');
              }
            }
          }
        }
      }
    };

    if (socket) {
      socket.on('game-result', callback);
    }

    return () => {
      if (socket) {
        socket.off('game-result', callback);
      }
    };
  }, [socket, session, myRoom, oppName, symbol, guestId, isHost]);

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
      setIsMatchDone(false);
      // setIsReady(false);
      setPauseMyInterval(true);
      setIsWin(null);

      socket.emit('exit-room', { room: myRoom }, (res) => {
        if (res.status === 'ok') {
          setTimeout(() => {
            setOpenAlertModal(true);
          }, 500);
        }
      })

    }

    if (socket) {
      socket.on('exit-room', () => callback());
    }

    return () => {
      if (socket) {
        socket.off('exit-room', () => callback());
      }
    };

  }, [socket, openAlertModal, myRoom]);

  useEffect(() => {
    const callback = (d) => {
      setEnemyTimer(d.timer);
    }

    if (socket) {
      socket.emit('player-details', {
        id: getFromStorage('player-id'),
        name: getFromStorage('player-name'),
        type: 'initial'
      });
      socket.on('enemy-timer', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('enemy-timer', (d) => callback(d));
      }
    }
  }, [socket]);

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch('/api/socketio');
      const newSocket = io();

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('update-online-players', (count) => {
        setOnlinePlayers(count);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    };

    if (!socket) {
      socketInitializer();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);



  const router = useRouter();
  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        // Will run when leaving the current page; on back/forward actions
        // Add your logic here, like toggling the modal state
        if (isReady && !isMatchDone) {
          handleResultModalExit();
        } else if (isReady && isMatchDone) {
          handleResultModalExit();
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isReady, isMatchDone]);

  const handleJoinRoom = (isPlayAgain = false) => {
    if (socket.connected) {

      if (isPlayAgain) {
        setIsMatchDone(false);
        socket.emit('join-room', { id: socket.id, name: userName, room: myRoom });
      } else {
        socket.emit('join-room', { id: socket.id, name: userName, room: '' });
      }
    }
  }

  const signIn = () => {
    Router.push('/signin')
  }

  const handleCellClick = (i) => {
    setPauseMyInterval(true);
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
    setMatchScore({
      me: 0, enemy: 0
    });
    socket.emit('exit-room', { room: myRoom }, (res) => {
      if (res.status === 'ok') {
        setEnemyTimer(TIMER_SECS);
        setMyRoom('');
        setIsHost(null);
        setMoves(DEFAULT_MOVES.current);
        // setOppName('');
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
            setTimer(TIMER_SECS);
            setEnemyTimer(TIMER_SECS);
            setIsMatchDone(false);
            setIsReady(false);
            setIsLoading(!isRematch ? true : false);
            setMoves(DEFAULT_MOVES.current);
            // setIsMyTurn(false);
            // setSymbol('');
          }
        });
    } else {
      if (isHost) {
        clearTimeout(mySetTimeout.current);
        setIsLoading(true);
        setIsReady(false);
        setMoves(DEFAULT_MOVES.current);
        setIsMatchDone(false);
        setEnemyTimer(TIMER_SECS);
        setTimer(TIMER_SECS);
        setIsWin(null);
        setIntroModal(false);
      } else {
        handleJoinRoom(true);
      }
    }

  }
  function signOutUser() {
    signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/`,
    });
  }
  
  return (
    <AnimatePage >
      <div className="app font-sans relative">
        <GameStartIntroModal open={openIntroModal}></GameStartIntroModal>
        <GameResultModal clickExit={handleResultModalExit}
                         clickPlayAgain={handleResultModalPlayAgain} modalDesc={resultModalDesc}
                         open={isMatchDone} win={isWin}></GameResultModal>
        <AlertModal open={openAlertModal} clickExit={handleResultModalExit}></AlertModal>
          <div  className="bg-[url('/index.jpg')] bg-cover bg-center min-h-screen">
          <div className="bg-white bg-opacity-90 p-6 h-screen flex flex-col justify-between">
            {isHost !== null &&
                (
                    <div className="relative w-auto">
                      <div className="w-auto flex justify-center">

                        <div className="flex items-center">
                          <div
                              className="mr-4 rounded-sm text-2xl w-10 h-3/6 bg-gray-50 bg-opacity-10 flex justify-center items-center font-medium">{matchScore.me}</div>

                          <div className={"flex w-28 flex-col mr-10 " + (isMyTurn ? "" : "opacity-50")}>
                            <div
                                className="player-cardjustify-start relative overflow-hidden h-12 w-[120px] rounded-sm flex">
                              <div
                                  className={'symbol w-[40px] mr-2 h-full relative overflow-hidden flex justify-center items-center ' + symbol}></div>
                              <div className="time-container min-w-[48px] text-3xl after:h-full items-center flex">
                                <div>{timer}</div>
                              </div>
                            </div>
                            <TimerBar timer={timer} matchDone={isMatchDone} secs={TIMER_SECS}
                                      start={(isReady && !isLoading && isMyTurn)} left={true}></TimerBar>
                            <div className="mt-1 whitespace-nowrap overflow-hidden overflow-ellipsis">{userName}</div>
                          </div>
                        </div>


                        <div className="flex items-center">
                          <div className={"flex w-28 flex-col justify-end  " + (!isMyTurn ? "" : "opacity-50")}>
                            <div className="player-card justify-end relative overflow-hidden h-12 rounded-sm flex">
                              <div
                                  className="time-container min-w-[48px] text-3xl h-full items-center justify-end flex">
                                <div>{enemyTimer}</div>
                              </div>
                              <div
                                  className={'symbol w-[40px] ml-2 h-full relative overflow-hidden flex justify-center items-center ' + (symbol === 'x' ? 'circle' : 'x')}></div>
                            </div>
                            <TimerBar timer={enemyTimer} matchDone={isMatchDone} secs={TIMER_SECS}
                                      start={(isReady && !isLoading && !isMyTurn)} left={false}></TimerBar>

                            <div
                                className="flex justify-end mt-1 whitespace-nowrap overflow-hidden overflow-ellipsis">{oppName || ' - '}</div>
                          </div>

                          <div
                              className="ml-4 rounded-sm text-2xl w-10 h-3/6 bg-gray-50 bg-opacity-10 flex justify-center items-center font-medium">{matchScore.enemy}</div>
                        </div>


                      </div>

                    </div>

                )}

            {(!isReady && myRoom === '') &&
                (
                    <div className="relative z-10">
                      {/* Title */}
                      <div
                          className="flex justify-between items-center bg-indigo-600 p-3 rounded-lg border-4 border-black text-white shadow-xl mb-6">
                        <div className="flex-grow">
                          <h1 className="text-3xl font-bold ml-5">Tic-tac-toe Multiplayer Game</h1>
                        </div>
                        <div id="online-players-container" className="absolute flex left-3/4 items-center">
                          <div className="mr-2 inline w-2 h-2 bg-green-500 rounded-full relative"></div>
                          <div className="flex -left-24 text-sm font-light">
                            <span className="font-semibold mr-1">{onlinePlayers}</span>
                            Online Player/s
                        </div>
                        </div>
                        <div className="flex">
                          {session?.user ? (
                              <button disabled={!socket}
                                      id="signout"
                                      className="bg-rose-400 px-5 py-3 font-bold text-black rounded-3xl border-4 border-black shadow-xl transform hover:scale-110 hover:text-white hover:bg-rose-500 transition duration-200"
                                      onClick={signOutUser}>Sign out</button>
                          ) : (
                              <button disabled={!socket}
                                      id="signin"
                                      className="bg-rose-400 px-5 py-3 font-bold text-black rounded-3xl border-4 border-black shadow-xl transform hover:scale-110 hover:text-white hover:bg-rose-500 transition duration-200"
                                      onClick={signIn}>Sign in</button>
                          )
                          }
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 flex-grow">
                      {/* Ranking Section */}
                        <div
                            className="bg-purple-300 p-4 rounded-lg border-4 border-black shadow-xl h-full overflow-hidden">
                        <h2 className="text-2xl font-bold mb-6 text-center">Ranking</h2>
                            <hr className="border-2 border-black"/>
                            <TopPlayers/>
                          </div>
                          {/* Game Section */}
                          <div className="p-4 rounded-lg flex flex-col items-center justify-center">
                            <div
                                className="w-60 h-60 bg-[url('/game.png')] bg-cover bg-center mb-4 rounded-none border-4 border-black shadow-xl">

                            </div>
                            <button disabled={!socket}
                                    id="findMatchBtn"
                                    className="bg-rose-400 px-10 py-4 rounded-lg border-4 border-black mb-2 font-bold text-2xl shadow-xl hover:shadow-rose-600/40 transform hover:scale-110 hover:bg-rose-500 hover:text-white transition duration-200"
                                    onClick={handleJoinRoom}>Find Match
                            </button>
                          </div>
                          {/* Player Section */}
                          <div
                              className="bg-purple-300 p-4 rounded-lg border-4 border-black shadow-xl h-full overflow-hidden">
                            <h2 className="text-3xl font-bold mb-6 text-center">Stats</h2>
                            <hr className="border-2 border-black"/>

                            <div className="text-center text-4xl xs:text-3xl font-light mt-9">Name: {userName}</div>
                            <div className="flex mt-12">
                              <PlayerStats/>
                            </div>
                          </div>
                        </div>
                        <div className="flex xs:w-full h-min flex-wrap rounded-md p-5 xs:pt-7">
                        </div>
                      </div>
                )
            }
            {(isReady && !isLoading && myRoom !== '') && (
                <div style={{pointerEvents: (isMyTurn ? 'auto' : 'none')}}
                     className={'board ' + (isMyTurn ? symbol : '')} id='board'>
                  {moves.map((cell, i) => (
                      <div className={'cell ' + cell}
                           onClick={() => handleCellClick(i)} data-cell
                           key={i + cell} index={i} id={'cell' + i}></div>
                  ))}
                </div>
            )}
            {(!isReady && isLoading) && (
                <div className="justify-center flex flex-col items-center relative h-full pb-40 xs:pb-52">
                  <div className="text-sm mb-2 opacity-80">waiting for opponent . . .</div>
                  <span className="loader"></span>
                </div>
            )}
          </div>
        </div>
        </div>
    </AnimatePage>
  )
}
