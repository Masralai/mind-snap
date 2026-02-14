"use client";
import { useEffect, useState } from "react";
import { RainbowButton } from "./ui/rainbow-button";

interface TileProps {
    value: number;
    onclick: () => void;
}

function Tile({ value, onclick }: TileProps) {
    let bgColor = "bg-blue-600";
    if (value === 1) bgColor = "bg-green-500";
    if (value === 2) bgColor = "bg-red-500";

    return (
        <div onClick={onclick} className={`h-16 w-16 rounded-sm ${bgColor}`} />
    );
}

export default function Grid() {
    const [grid, setGrid] = useState<number[]>(Array(25).fill(0));
    const [pattern, setPattern] = useState<number[]>([]);
    const [isFlashing, setIsFlashing] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);

    useEffect(() => {
        if (!isActive) return;
        var interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    function startGame() {
        if (timeLeft == 0) {
            setTimeLeft(60);
            setScore(0);
        }
        setIsActive(true);
        setIsFlashing(true);
        var arr = Array.from({ length: 25 }, (_, i) => i);
        var correctTiles = Math.floor(Math.random() * 4) + 8;
        var correctPattern = arr
            .sort(() => Math.random() - 0.5)
            .slice(0, correctTiles);
        setPattern(correctPattern);

        var newArr = Array(25).fill(0); //cross check
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
        if (isFlashing) return;
        if (grid[idx] !== 0) return;
        const newGrid = [...grid];
        if (pattern.includes(idx)) newGrid[idx] = 1;
        else {
            newGrid[idx] = 2;
            setIsFlashing(true);
            setTimeout(() => {
                startGame();
                return;
            }, 1000);
        }
        setGrid(newGrid);
        var count = newGrid.filter((value) => {
            return value == 1;
        }).length;

        if (count == pattern.length) {
            setScore((s) => s + 1);
            setIsFlashing(true);
            setTimeout(() => {
                startGame();
            }, 1000);

        }

    }

    return (
        <div className="flex flex-col h-screen w-screen items-center justify-center">
            {timeLeft > 0 ? (
                <>
                    <div className="flex gap-4 items-center">
                        <RainbowButton variant="outline" className="cursor-auto">{timeLeft}s</RainbowButton>
                    </div>
                    <br />
                    <div className="grid grid-cols-5 gap-1 w-fit ">
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
                <RainbowButton variant="outline" onClick={() => startGame()}>
                    Start Game
                </RainbowButton>
            )}
        </div>
    );
}
