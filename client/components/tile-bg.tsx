"use client"

import { Tiles } from "@/components/ui/tiles"

export function TilesBG() {
  return (
    <div className="w-full min-h-screen">
      <Tiles 
        rows={32} 
        cols={8}
        tileSize="md"
      />
    </div>
  )
}