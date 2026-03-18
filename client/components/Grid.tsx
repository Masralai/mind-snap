"use client";
import { useEffect, useState, useRef } from "react";
import { RainbowButton } from "./ui/rainbow-button";
import { io, Socket } from "socket.io-client";

interface TileProps {
    value: number;
    onclick: () => void;
}

function Tile({ value, onclick }: TileProps) {
    let bgColor = "bg-[#00BCFF]";
    if (value === 1) bgColor = "bg-[#03fc49]";
    if (value === 2) bgColor = "bg-[#FF0033]";

    return (
        <div onClick={onclick} className={`h-16 w-16 rounded-sm ${bgColor} cursor-pointer hover:opacity-80 transition-opacity`} />
    );
}

let socket: Socket | undefined;

export default function Grid() {
    
    const [grid, setGrid] = useState<number[]>(Array(25).fill(0));
    const [pattern, setPattern] = useState<number[]>([]);
    const [isFlashing, setIsFlashing] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);

   
    const [roomId, setRoomId] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [isJoined, setIsJoined] = useState<boolean>(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [gameOverState, setGameOverState] = useState<{players: Record<string, any>} | null>(null);

    // Synchronized pattern references
    const allPatternsRef = useRef<number[][]>([]);
    const patternIndexRef = useRef<number>(0);

    

    useEffect(() => {
        
        if (!socket) {
            socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
        }

        socket.on("room-updated", (room) => {
            setPlayers(Object.values(room.players));
        });

        socket.on("game-started", (room) => {
            setScore(0);
            setTimeLeft(60);
            setIsActive(true);
            setGameOverState(null);
            
            allPatternsRef.current = room.patterns;
            patternIndexRef.current = 0;
            if (room.patterns && room.patterns.length > 0) {
                applyPattern(room.patterns[0]);
            }
        });

        socket.on("timer-update", (time: number) => {
            setTimeLeft(time);
        });

        socket.on("game-over", (room) => {
            setIsActive(false);
            setPlayers(Object.values(room.players));
            setGameOverState(room);
            setGrid(Array(25).fill(0));
            setPattern([]);
        });

        return () => {
            socket?.off("room-updated");
            socket?.off("game-started");
            socket?.off("timer-update");
            socket?.off("game-over");
        };
    }, []);

    
    useEffect(() => {
        if (socket && isJoined) {
            socket.emit("score-update", roomId, score);
        }
    }, [score, isJoined]); 

    function joinRoom() {
        if (roomId.trim() && username.trim() && socket) {
            socket.emit("join-room", roomId, username);
            setIsJoined(true);
        }
    }

    function emitStartGame() {
        if (socket && roomId) {
            socket.emit("start-game", roomId);
        }
    }

    function applyNextPattern() {
        patternIndexRef.current += 1;
        const nextPattern = allPatternsRef.current[patternIndexRef.current];
        if (nextPattern) {
            applyPattern(nextPattern);
        }
    }

    function applyPattern(correctPattern: number[]) {
        setIsFlashing(true);
        setPattern(correctPattern);

        var newArr = Array(25).fill(0); 
        correctPattern.forEach((i) => {
            newArr[i] = 1;
        });

        setGrid(newArr);
        setTimeout(() => {
            setIsFlashing(false);
            setGrid(Array(25).fill(0));
        }, 1500);
    }

    function handleTileClick(idx: number) {
        if (!isActive || isFlashing) return;
        if (grid[idx] !== 0) return;
        const newGrid = [...grid];
        if (pattern.includes(idx)) newGrid[idx] = 1;
        else {
            newGrid[idx] = 2;
            setIsFlashing(true);
            setTimeout(() => {
                applyNextPattern();
                return;
            }, 1000);
        }
        setGrid(newGrid);
        var count = newGrid.filter((value) => {
            return value == 1;
        }).length;

        if (count == pattern.length) {
            setScore((s) => s + 10);
            setIsFlashing(true);
            setTimeout(() => {
                applyNextPattern();
            }, 1000);
        }
    }

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    if (!isJoined) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center gap-6 z-20 relative bg-[#060010] backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-white mb-4 shadow-lg drop-shadow-lg">Mind Snap Multiplayer</h1>
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        className="px-4 py-3 rounded-lg bg-slate-900/80 text-white border border-slate-700 w-72 focus:outline-none focus:border-[#00BCFF] transition-colors"
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Room ID" 
                        className="px-4 py-3 rounded-lg bg-slate-900/80 text-white border border-slate-700 w-72 focus:outline-none focus:border-[#00BCFF] transition-colors"
                        value={roomId} 
                        onChange={e => setRoomId(e.target.value)}
                    />
                </div>
                <RainbowButton className="mt-4" onClick={joinRoom}>Join Game Room</RainbowButton>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen relative z-20 items-center justify-center">
            {/* Main Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative h-full">
                {isActive ? (
                    <>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2">
                            <RainbowButton variant="outline" className="cursor-auto text-2xl font-bold px-8 pointer-events-none">
                                {timeLeft}s
                            </RainbowButton>
                        </div>
                        <div className="grid grid-cols-5 gap-1 w-fit mt-12 bg-black/40 p-2 rounded-xl backdrop-blur-sm shadow-xl">
                            {grid.map((value, idx) => (
                                <Tile
                                    key={idx}
                                    value={value}
                                    onclick={() => handleTileClick(idx)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500 bg-black/60 p-12 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
                        {gameOverState ? (
                            <div className="text-center flex flex-col gap-4">
                                <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Game Over</p>
                                <h3 className="text-4xl text-white font-black mb-6">Final Results</h3>
                                <div className="flex flex-col gap-3">
                                {Object.values(gameOverState.players).sort((a: any, b: any) => b.score - a.score).map((p: any, idx: number) => (
                                    <div key={p.id} className="flex justify-between w-64 text-xl border-b border-slate-800 pb-2">
                                        <span className="text-slate-300 flex gap-2">
                                            <span className="text-slate-500">{idx + 1}.</span> 
                                            {p.username}
                                        </span>
                                        <span className="text-[#03fc49] font-black">{p.score}</span>
                                    </div>
                                ))}
                                </div>
                                <div className="mt-12">
                                    <RainbowButton onClick={emitStartGame}>Play Again</RainbowButton>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-2xl text-white mb-8">Waiting for players to start...</h3>
                                <RainbowButton onClick={emitStartGame}>Start Game</RainbowButton>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar Leaderboard */}
            <div className="w-80 bg-black/80 border-l border-slate-800 p-6 flex flex-col gap-4 h-full relative z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold text-[#00BCFF] uppercase tracking-widest text-center shadow-lg">Room: {roomId}</h2>
                <div className="flex flex-col gap-3 mt-4 overflow-y-auto pr-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800 pb-2">Leaderboard</p>
                    {sortedPlayers.map((p, idx) => (
                        <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${p.id === socket?.id ? 'bg-slate-800/80 border-[#00BCFF]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'bg-slate-900/50 border-slate-800/50'}`}>
                            <span className="text-slate-200 truncate font-medium flex items-center gap-2" title={p.username}>
                                <span className={`w-5 text-center font-bold ${idx === 0 && p.score > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>{idx + 1}.</span> 
                                {p.username} {p.id === socket?.id && <span className="text-[10px] font-bold bg-[#00BCFF]/20 text-[#00BCFF] px-2 py-0.5 rounded-full uppercase ml-1">You</span>}
                            </span>
                            <span className="text-[#03fc49] font-black tracking-wider">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
