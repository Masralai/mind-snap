# Mind Snap

Mind Snap is a real-time multiplayer memory game. Players join a room, watch a sequence of flashing tiles on a grid, and try to click the correct tiles to earn points. The game lasts for 60 seconds, and the player with the highest score at the end wins.

## Features

- Real-time multiplayer gameplay
- Shared game rooms where players can compete together
- A live scoreboard that updates as players score points
- Automatic pattern generation that gets mixed up every round

## How to Play

1. Open the game link in your browser.
2. Enter any name and a room ID. Share this room ID with your friends so they can join the exact same game.
3. Click "Join Game Room".
4. Once everyone is in, click "Start Game".
5. Watch the grid carefully. A pattern of tiles will light up for a brief moment.
6. Click the tiles you remember seeing.
7. If you get all the tiles right, you earn points and move to the next pattern.
8. If you click a wrong tile, the pattern resets.
9. Keep matching patterns as fast as you can before the 60-second timer runs out.

## Project Structure

The project has two main sections:
- **Client**: The visual part of the game you interact with, built using React and Next.js.
- **Server**: The background system that connects players and runs the game timer, built using Express and Socket.IO.

## Running the Game Locally

To run the game on your own computer, you need to start both the server and the client. You should have Node.js installed.

### Starting the Server

1. Open a terminal and go into the `server` folder.
2. Run `npm install` to download all the needed files.
3. Run `npm run dev` to start the server. It will run on port 3001.

### Starting the Client

1. Open a new, separate terminal and go into the `client` folder.
2. Run `npm install` to download all the needed files.
3. Run `npm run dev` to start the visual interface.
4. Open your web browser and go to `http://localhost:3000` to play the game.
