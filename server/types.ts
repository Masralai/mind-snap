export interface Gamestate{
    pattern:number[],
    scores: Record<string,number>,
    timeLeft: number,
    isActive:boolean,
    gridSize :number   
}