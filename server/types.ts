export interface Player {
    id: string;
    username: string;
    score: number;
    roomId: string;
}

export interface RoomState {
    roomId: string;
    players: Record<string, Player>;
    timeLeft: number;
    isActive: boolean;
    patterns: number[][];
}