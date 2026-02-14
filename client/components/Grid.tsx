"use client"
import { useEffect, useState } from "react"
import { RainbowButton } from "./ui/rainbow-button"

interface TileProps {
    value: number,
    onclick: () => void
}

function Tile({ value, onclick }: TileProps) {


    let bgColor = "bg-blue-600"
    if (value === 1) bgColor = "bg-green-500"
    if (value === 2) bgColor = "bg-red-500"

    return (
        <div

            onClick={onclick}
            className={`h-16 w-16 rounded-sm ${bgColor}`}
        />
    )
}

export default function Grid() {
    const [grid, setGrid] = useState<number[]>(Array(25).fill(0))
    const [pattern, setPattern] = useState<number[]>([])
    const [isFlashing, setIsFlashing] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0)
    const [timeLeft, setTimeLeft] = useState<number>(60)
    const [isActive, setIsActive] = useState<boolean>(false)

    useEffect(() => {
        var interval = setInterval(()=>{
            setTimeLeft(prev=>prev-1)
            return ()=>clearInterval(interval)
        },1000)
    }, [isActive])
    

    function startGame() {

        setIsActive(true)

        setIsFlashing(true)
        var arr = Array.from({ length: 25 }, (_, i) => i)
        arr = arr.sort(() => Math.random() - 0.5).slice(0, 10)
        setPattern(arr)

        var newArr = Array(25).fill(0)
        arr.forEach((i) => { newArr[i] = 1 })

        setGrid(newArr)
        setTimeout(() => {
            setIsFlashing(false)
            setGrid(Array(25).fill(0))
        }, 1500)

    }

    function handleTileClick(idx: number) {
        if (isFlashing) return
        if (grid[idx] !== 0) return
        const newGrid = [...grid]
        if (pattern.includes(idx)) newGrid[idx] = 1
        else newGrid[idx] = 2
        setGrid(newGrid)
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <RainbowButton variant="outline" >{timeLeft}</RainbowButton>
            <div className="grid grid-cols-5 gap-1 w-fit ">
                {grid.map((value, idx) => (
                    <Tile key={idx} value={value} onclick={() => handleTileClick(idx)} />

                ))}

                <RainbowButton variant="outline" onClick={() => startGame()}>Start Game</RainbowButton>
            </div>
        </div>


    )
}