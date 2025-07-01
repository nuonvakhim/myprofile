import React, { useState, useEffect, useCallback } from 'react';

const gameStyles = `
    .cell {
        width: 75px;
        height: 75px;
        border: 3px solid #4a5568;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.25rem;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }
    @media (max-width: 600px) {
        .cell {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
        }
    }
    .cell:hover {
        background-color: #4a5568;
    }
    .cell.x {
        color: #63b3ed; /* Blue for X */
    }
    .cell.o {
        color: #f6ad55; /* Orange for O */
    }
    .winning-cell {
        background-color: #f6e05e; /* Yellow highlight */
        color: #1a202c !important; /* Dark text for contrast */
        text-decoration: underline;
        text-decoration-thickness: 4px;
        text-decoration-color: #2d3748;
    }
    .pixel-button {
        background-color: #4a5568;
        border: none;
        padding: 1rem 2rem;
        color: #e2e8f0;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: inset -4px -4px 0px 0px #2d3748;
        transition: all 0.1s ease-in-out;
        margin: 0 0.5rem;
    }
    .pixel-button:hover {
        background-color: #718096;
        box-shadow: inset -6px -6px 0px 0px #4a5568;
    }
    .pixel-button:active {
        box-shadow: inset 4px 4px 0px 0px #2d3748;
    }
    .pixel-button:disabled {
        background-color: #2d3748;
        cursor: not-allowed;
        opacity: 0.6;
    }
`;


const TicTacToeGame: React.FC = () => {
    // --- Constants ---
    const GRID_SIZE = 6;
    const WIN_LENGTH = 4;

    // --- State Management using React Hooks ---
    const [board, setBoard] = useState<string[]>(Array(GRID_SIZE * GRID_SIZE).fill(''));
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
    const [isGameActive, setIsGameActive] = useState<boolean>(false); // Game starts inactive
    const [status, setStatus] = useState<string>("Select a game mode");
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const [gameMode, setGameMode] = useState<'pvp' | 'pva' | null>(null); // Player vs Player or Player vs AI
    const [isAiThinking, setIsAiThinking] = useState<boolean>(false); // Lock to prevent AI double moves

    // --- Game Logic Functions ---

    const startGame = (mode: 'pvp' | 'pva') => {
        setGameMode(mode);
        setIsGameActive(true);
        setStatus("Player X's turn");
    };

    const handleRestartGame = () => {
        setBoard(Array(GRID_SIZE * GRID_SIZE).fill(''));
        setCurrentPlayer('X');
        setIsGameActive(false); // Go back to mode selection
        setStatus("Select a game mode");
        setWinningLine(null);
        setGameMode(null);
        setIsAiThinking(false);
    };

    const handleCellClick = (index: number) => {
        // Prevent click if cell is taken, game is over, or it's AI's turn
        if (board[index] !== '' || !isGameActive || (gameMode === 'pva' && currentPlayer === 'O')) {
            return;
        }

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);
    };

    /**
     * Checks if a player has won. Wrapped in useCallback for optimization.
     * @param player The player to check ('X' or 'O').
     * @returns An array of winning cell indices, or null if no win.
     */
    const checkWin = useCallback((player: 'X' | 'O', currentBoard: string[]): number[] | null => {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Horizontal
                if (c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => r * GRID_SIZE + c + i);
                    if (line.every(index => currentBoard[index] === player)) return line;
                }
                // Vertical
                if (r + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + c);
                    if (line.every(index => currentBoard[index] === player)) return line;
                }
                // Diagonal (top-left to bottom-right)
                if (r + WIN_LENGTH <= GRID_SIZE && c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c + i));
                    if (line.every(index => currentBoard[index] === player)) return line;
                }
                // Diagonal (top-right to bottom-left)
                if (r + WIN_LENGTH <= GRID_SIZE && c - WIN_LENGTH + 1 >= 0) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c - i));
                    if (line.every(index => currentBoard[index] === player)) return line;
                }
            }
        }
        return null;
    }, []); // No dependency needed as board is passed in

    const makeAiMove = useCallback(() => {
        // AI move logic is now simpler: just update the board.
        setTimeout(() => {
            setBoard(currentBoard => {
                const availableCells = currentBoard
                    .map((cell, index) => (cell === '' ? index : null))
                    .filter(index => index !== null);

                if (availableCells.length > 0) {
                    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)] as number;
                    const newBoard = [...currentBoard];
                    newBoard[randomIndex] = 'O';
                    return newBoard;
                }
                return currentBoard;
            });
        }, 500);
    }, []);


    // --- Effect Hook to check for win/draw and control game flow ---
    useEffect(() => {
        if (!isGameActive) return;

        const xCount = board.filter(c => c === 'X').length;
        const oCount = board.filter(c => c === 'O').length;

        // Don't do anything on the initial empty board
        if (xCount === 0 && oCount === 0) return;

        const lastPlayer = (xCount > oCount) ? 'X' : 'O';

        const winnerInfo = checkWin(lastPlayer, board);
        if (winnerInfo) {
            setStatus(`Player ${lastPlayer} Wins!`);
            setIsGameActive(false);
            setWinningLine(winnerInfo);
            return;
        }

        if (!board.includes('')) {
            setStatus('Game is a Draw!');
            setIsGameActive(false);
            return;
        }

        const nextPlayer = lastPlayer === 'X' ? 'O' : 'X';
        setCurrentPlayer(nextPlayer);
        setStatus(`Player ${nextPlayer}'s turn`);

        // THE FIX: Only unlock the AI when the turn has successfully passed back to the player.
        if (nextPlayer === 'X') {
            setIsAiThinking(false);
        }

    }, [board, isGameActive, checkWin]);

    // --- Effect Hook for AI's turn ---
    useEffect(() => {
        // This effect now just decides *when* to trigger the AI move.
        if (gameMode === 'pva' && currentPlayer === 'O' && isGameActive && !isAiThinking) {
            setIsAiThinking(true); // Lock before making a move
            makeAiMove();
        }
    }, [currentPlayer, gameMode, isGameActive, isAiThinking, makeAiMove]);


    return (
        <div className="w-full max-w-xl text-center">
            <style>{gameStyles}</style>
            <h1 className="text-4xl md:text-5xl mb-4 text-white">Four in a Row</h1>

            <div className="text-2xl text-yellow-400 font-bold h-8 mb-4">
                {status}
            </div>

            {!gameMode ? (
                <div className="my-4">
                    <button onClick={() => startGame('pvp')} className="pixel-button">Player vs Player</button>
                    <button onClick={() => startGame('pva')} className="pixel-button">Player vs AI</button>
                </div>
            ) : (
                <>
                    <div
                        id="game-board"
                        className="grid gap-0 mx-auto bg-gray-700 border-gray-800 border-4 rounded-lg"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            width: 'min(90vw, 450px)',
                            height: 'min(90vw, 450px)',
                            pointerEvents: isAiThinking ? 'none' : 'auto', // Prevent clicks while AI is thinking
                            opacity: isAiThinking ? 0.7 : 1,
                        }}
                    >
                        {board.map((value, index) => {
                            const cellPlayerClass = value ? ` ${value.toLowerCase()}` : '';
                            const cellWinningClass = winningLine?.includes(index) ? ' winning-cell' : '';

                            return (
                                <div
                                    key={index}
                                    className={`cell${cellPlayerClass}${cellWinningClass}`}
                                    onClick={() => handleCellClick(index)}
                                >
                                    {value}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6">
                        <button onClick={handleRestartGame} className="pixel-button">
                            Restart
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TicTacToeGame;