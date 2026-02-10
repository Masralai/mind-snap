import { GridPattern } from "@/components/ui/grid-pattern"

import { cn } from "@/lib/utils";

export default function Background () {
  return (
    <div className="relative bg-black flex h-lvh w-full flex-col items-center justify-center overflow-hidden  md:shadow-xl">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
        
      </p>
      <GridPattern
        strokeDasharray="2"
        width={100}
        height={10}
        className={cn(
          //"`mask-[radial-gradient(500px_circle_at_center,white,transparent)]`",
          "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  )
}
  
