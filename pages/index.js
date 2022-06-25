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

export default function Home() {

  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [locationKeys, setLocationKeys] = useState([]);

  const DEFAULT_MOVES = useRef(['', '', '', '', '', '', '', '', '']);
  const TIMER_SECS = 15.0;
  const [socket, setSocket] = useState(null);
  const [myRoom, setMyRoom] = useState('');
  const [myName, setMyName] = useState('me');
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
  const [myRecords, setMyRecords] = useState({
    wins: 0,
    loses: 0,
    draws: 0,
    total: 0,
    winRate: 0
  });
  const [pauseMyInterval, setPauseMyInterval] = useState(false);
  const [matchScore, setMatchScore] = useState({
    me: 0, enemy: 0
  });
  const didMount = useRef(false);

  useEffect(() => {

    didMount.current = true;
    const getPlayerName = () => {
      if (typeof getFromStorage('player-name') === 'undefined' ||
        getFromStorage('player-name') === null ||
        getFromStorage('player-name') === '') {
        Router.push('/signin');
      } else {
        setMyName(getFromStorage('player-name'));
        const record = JSON.parse(getFromStorage('player-record'));
        setMyRecords(record);
      }
    }

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

    getPlayerName();
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
    const callback = (d) => {
      if (d.result === 'done' && symbol) {
        for (let i = 0; i < 9; i++) {
          const el = document.getElementById('cell' + i);
          el.classList.add('lose');

          for (let j = 0; j < d.combination.length; j++) {
            if (i === d.combination[j]) {
              el.classList.remove('lose');
            }


          }
        }

        setTimeout(() => {
          const iWin = d.winner == symbol ? true : false;
          setIsWin(iWin);
          if (iWin) {
            setMatchScore(prevState => ({
              me: prevState.me + 1,
              enemy: prevState.enemy
            }));
            setMyRecords(d => ({ ...d, wins: d.wins + 1 }));
          } else if (!iWin) {
            setMatchScore(prevState => ({
              me: prevState.me,
              enemy: prevState.enemy + 1
            }));
            setMyRecords(d => ({ ...d, loses: d.loses + 1 }));
          }
          setIsMatchDone(true);
        }, 200);

      } else if (d.result === 'draw') {
        setMyRecords(d => ({ ...d, draws: d.draws + 1 }));
        setTimeout(() => {
          setIsWin(null);
          setIsMatchDone(true);
        }, 200);
      } else if (d.result === 'timesup' && symbol) {

        const isWin = d.winner == symbol ? true : false
        if (isWin) {
          setMyRecords(d => ({ ...d, wins: d.wins + 1 }));
        } else {
          setMyRecords(d => ({ ...d, loses: d.loses + 1 }));
        }

        setTimeout(() => {
          setIsWin(isWin);
          setIsMatchDone(true);
        }, 200);
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

    const callback = (d) => {
      setOnlinePlayers(d.onlinePlayers);
      console.log('online')
    }

    if (socket) {
      socket.on('server-data', (d) => callback(d));
    }

    return () => {
      if (socket) {
        socket.off('server-data', (d) => callback(d));
      }
    }

  }, [socket]);

  useEffect(() => {
    const total = myRecords.wins + myRecords.loses + myRecords.draws;
    setMyRecords(d => ({
      ...d,
      total: total
    }));

    // setToStorage('player-record')


  }, [myRecords.wins, myRecords.loses, myRecords.draws])

  useNoInitialEffect(() => {
    setToStorage('player-record', JSON.stringify(myRecords));
  }, [myRecords]);


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
        socket.emit('join-room', { id: socket.id, name: myName, room: myRoom });
      } else {
        socket.emit('join-room', { id: socket.id, name: myName, room: '' });
      }
    }
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


  return (
    <AnimatePage>
      <div className="app font-sans relative">
        <GameStartIntroModal open={openIntroModal}></GameStartIntroModal>
        <GameResultModal clickExit={handleResultModalExit}
          clickPlayAgain={handleResultModalPlayAgain} modalDesc={resultModalDesc}
          open={isMatchDone} win={isWin}></GameResultModal>
        <AlertModal open={openAlertModal} clickExit={handleResultModalExit}></AlertModal>

        <div className="max-w-4xl mx-auto m-0 p-3 h-screen relative overflow-hidden xs:overflow-auto">
          {isHost !== null &&
            (
              <div className="relative w-auto">
                <div className="w-auto flex justify-center">

                  <div className="flex items-center">
                    <div className="mr-4 rounded-sm text-2xl w-10 h-3/6 bg-gray-50 bg-opacity-10 flex justify-center items-center font-medium">{matchScore.me}</div>

                    <div className={"flex w-28 flex-col mr-10 " + (isMyTurn ? "" : "opacity-50")}>
                      <div className="player-cardjustify-start relative overflow-hidden h-12 w-[120px] rounded-sm flex">
                        <div className={'symbol w-[40px] mr-2 h-full relative overflow-hidden flex justify-center items-center ' + symbol}></div>
                        <div className="time-container min-w-[48px] text-3xl after:h-full items-center flex">
                          <div>{timer}</div>
                        </div>
                      </div>
                      <TimerBar timer={timer} matchDone={isMatchDone} secs={TIMER_SECS} start={(isReady && !isLoading && isMyTurn)} left={true}></TimerBar>

                      <div className="mt-1 whitespace-nowrap overflow-hidden overflow-ellipsis">{myName}</div>
                    </div>
                  </div>


                  <div className="flex items-center">
                    <div className={"flex w-28 flex-col justify-end  " + (!isMyTurn ? "" : "opacity-50")}>
                      <div className="player-card justify-end relative overflow-hidden h-12 rounded-sm flex">
                        <div className="time-container min-w-[48px] text-3xl h-full items-center justify-end flex">
                          <div>{enemyTimer}</div>
                        </div>
                        <div className={'symbol w-[40px] ml-2 h-full relative overflow-hidden flex justify-center items-center ' + (symbol === 'x' ? 'circle' : 'x')}></div>
                      </div>
                      <TimerBar timer={enemyTimer} matchDone={isMatchDone} secs={TIMER_SECS} start={(isReady && !isLoading && !isMyTurn)} left={false}></TimerBar>

                      <div className="flex justify-end mt-1 whitespace-nowrap overflow-hidden overflow-ellipsis">{oppName || ' - '}</div>
                    </div>

                    <div className="ml-4 rounded-sm text-2xl w-10 h-3/6 bg-gray-50 bg-opacity-10 flex justify-center items-center font-medium">{matchScore.enemy}</div>
                  </div>


                </div>

              </div>

            )}

          {(!isReady && myRoom === '') &&
            (
              <div className="flex xs:flex-col">
                <div className="flex flex-col w-full p-5">
                  <div className="text-5xl xs:text-4xl font-bold text-[#F7B12D] mt-9">Online Tictactoe</div>
                  <div className="text-4xl xs:text-3xl font-light mt-9">Wassup, {myName}!</div>
                  <div className="mt-3 xs:text-sm max-w-lg xs:max-w-xs">This project is designed and developed using <b>ReactJS</b>, <b>NextJS</b>, <b>Socket.IO</b>, and <b>Tailwind</b>.</div>
                  <div className="flex mt-12">
                    <button disabled={!socket}
                      id="findMatchBtn"
                      className="bg-gradient-shadow relative focus:outline-none focus:ring-4 focus:ring-offset-0 focus:ring-[#f7b02d39] rounded-full w-36 border-0 shadow-sm px-7 py-2 bg-gradient-to-tr from-[#F7B12D] via-[#FA8247] to-[#FC585D] text-sm font-medium text-white hover:opacity-90 focus:ring-offset-transparent sm:ml-3 sm:text-sm"
                      onClick={handleJoinRoom}>Find Match</button>
                  </div>

                </div>

                <div className="flex xs:w-full h-min flex-wrap rounded-md p-5 xs:pt-7">
                  <div id="online-players-container" className="flex items-center h-10 w-full">
                    <div className="mr-2 inline w-2 h-2 bg-green-500 rounded-full relative"></div>
                    <div className="text-sm font-light"><span className="font-semibold mr-1">{onlinePlayers}</span>
                      Online Player/s</div>
                  </div>

                  <div className="grid  gap-4 grid-cols-2">
                    <div id="total-matches-container" className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#EA0599] p-3 rounded-md h-20 w-28">
                      <div className="text-xs">Total Match</div>
                      <div className="font-semibold text-2xl">{myRecords.total}</div>
                    </div>

                    <div id="total-matches-container" className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#9A0F98] p-3 rounded-md h-20 w-28">
                      <div className="text-xs">Win Rate</div>
                      <div className="font-semibold text-xl">{(myRecords.total > 0 ? (myRecords.wins + 0.5 * myRecords.draws) / myRecords.total * 100 : 0).toFixed(2)}%</div>
                    </div>

                    <div id="total-matches-container" className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#6A0572] p-3 rounded-md h-20 w-28">
                      <div className="text-xs">Draw</div>
                      <div className="font-semibold text-2xl">{myRecords.draws}</div>
                    </div>

                    <div id="total-matches-container" className="bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#39065A] p-3 rounded-md h-20 w-28">
                      <div className="text-xs">Lose</div>
                      <div className="font-semibold text-2xl">{myRecords.loses}</div>
                    </div>

                    {/* <div id="total-matches-container" className="col-span-2 w-full bg-gradient-shadow relative flex flex-col justify-between bg-opacity-80 bg-[#FC585D] p-3 rounded-md">
                      <div className="text-xs">Rank Points</div>
                      <div className="font-semibold text-2xl text-right">1050</div>
                    </div>

                    <div id="total-matches-container" className="col-span-2 w-full bg-gradient-shadow relative flex flex-col justify-between bg-opacity-20 bg-[#7c7c7c] p-3 rounded-md">
                      <div className="text-xs mb-2">Top 5</div>
                      {
                        [{ n: 'Cale', rp: '2000' }, { n: 'Hazel', rp: '1950' }].map((item, i) => {
                          return (
                            <>
                              <div className="top-player border-b text-sm my-1 px-2 py-1 rounded-sm flex justify-between">
                                <span>
                                  <span className="font-mono mr-1">{i + 1}.</span>
                                  {item.n}
                                </span>
                                <span className="font-medium">{item.rp} RP</span>
                              </div>
                            </>
                          )
                        })
                      }

                    </div> */}

                  </div>


                </div>
              </div>

            )
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
            <div className="justify-center flex flex-col items-center relative h-full pb-40 xs:pb-52">
              <div className="text-sm mb-2 opacity-80">waiting for opponent . . .</div>
              <span className="loader"></span>
            </div>
          )}
        </div>
      </div>
    </AnimatePage>
  )
}
