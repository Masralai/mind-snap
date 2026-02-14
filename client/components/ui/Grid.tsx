"use client"
import { useState } from "react"

interface TileProps {
    value: number,
    onclick: () => void
}

function Tile({ value, onclick }: TileProps) {

    return (
        <div

            onClick={onclick}
            className={`h-16 w-16 rounded-sm ${value === 1 ? "bg-green-500" : "bg-blue-600"}`}
        />
    )
}

export default function Grid() {
    const [grid, setGrid] = useState(Array(25).fill(0))

    function handleTileClick(idx: number) {
        const newGrid = [...grid]
        newGrid[idx] = 1
        setGrid(newGrid)
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="grid grid-cols-5 gap-1 w-fit ">
                {grid.map((value, idx) => (
                    <Tile key={idx} value={value} onclick={() => handleTileClick(idx)} />

                ))}
            </div>
        </div>


    )
}