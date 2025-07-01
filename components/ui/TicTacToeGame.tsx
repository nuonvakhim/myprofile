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
    const [isGameActive, setIsGameActive] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Select a game mode");
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const [gameMode, setGameMode] = useState<'pvp' | 'pva' | null>(null);
    const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

    // --- Game Logic Functions ---

    const startGame = (mode: 'pvp' | 'pva') => {
        setGameMode(mode);
        setIsGameActive(true);
        setStatus("Player X's turn");
    };

    const handleRestartGame = () => {
        setBoard(Array(GRID_SIZE * GRID_SIZE).fill(''));
        setCurrentPlayer('X');
        setIsGameActive(false);
        setStatus("Select a game mode");
        setWinningLine(null);
        setGameMode(null);
        setIsAiThinking(false);
    };

    const handleCellClick = (index: number) => {
        if (board[index] !== '' || !isGameActive || (gameMode === 'pva' && currentPlayer === 'O')) {
            return;
        }

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);
    };

    /**
     * Checks if a player has won.
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
    }, []);

    /**
     * Evaluates potential winning/blocking opportunities for a given player
     */
    const evaluatePosition = useCallback((currentBoard: string[], player: 'X' | 'O'): { index: number, score: number }[] => {
        const availableCells = currentBoard
            .map((cell, index) => (cell === '' ? index : null))
            .filter(index => index !== null) as number[];

        const evaluations: { index: number, score: number }[] = [];

        for (const cellIndex of availableCells) {
            let score = 0;
            const testBoard = [...currentBoard];
            testBoard[cellIndex] = player;

            // Check if this move wins the game
            if (checkWin(player, testBoard)) {
                score += 1000; // Winning move gets highest priority
            }

            // Check if this move blocks opponent from winning
            const opponent = player === 'X' ? 'O' : 'X';
            const opponentTestBoard = [...currentBoard];
            opponentTestBoard[cellIndex] = opponent;
            if (checkWin(opponent, opponentTestBoard)) {
                score += 500; // Blocking opponent win gets high priority
            }

            // Evaluate potential for creating threats
            score += evaluateThreats(testBoard, cellIndex, player);

            // Add positional bonus for center and strategic positions
            score += getPositionalScore(cellIndex);

            evaluations.push({ index: cellIndex, score });
        }

        return evaluations.sort((a, b) => b.score - a.score);
    }, [checkWin]);

    /**
     * Evaluates how many potential winning lines this move creates or extends
     */
    const evaluateThreats = (board: string[], cellIndex: number, player: 'X' | 'O'): number => {
        let threatScore = 0;
        const row = Math.floor(cellIndex / GRID_SIZE);
        const col = cellIndex % GRID_SIZE;

        // Check all possible lines through this cell
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal
            [1, -1]  // anti-diagonal
        ];

        for (const [dr, dc] of directions) {
            // Count consecutive pieces in both directions
            let consecutiveCount = 1; // Count the current move
            let potentialSpaces = 0;

            // Check forward direction
            for (let i = 1; i < WIN_LENGTH; i++) {
                const newRow = row + i * dr;
                const newCol = col + i * dc;
                const newIndex = newRow * GRID_SIZE + newCol;

                if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) break;

                if (board[newIndex] === player) {
                    consecutiveCount++;
                } else if (board[newIndex] === '') {
                    potentialSpaces++;
                    break;
                } else {
                    break; // Opponent piece blocks this direction
                }
            }

            // Check backward direction
            for (let i = 1; i < WIN_LENGTH; i++) {
                const newRow = row - i * dr;
                const newCol = col - i * dc;
                const newIndex = newRow * GRID_SIZE + newCol;

                if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) break;

                if (board[newIndex] === player) {
                    consecutiveCount++;
                } else if (board[newIndex] === '') {
                    potentialSpaces++;
                    break;
                } else {
                    break; // Opponent piece blocks this direction
                }
            }

            // Score based on consecutive pieces and potential
            if (consecutiveCount >= 2) {
                threatScore += consecutiveCount * 10;
            }
            if (consecutiveCount + potentialSpaces >= WIN_LENGTH) {
                threatScore += 5; // Bonus for having potential to win in this line
            }
        }

        return threatScore;
    };

    /**
     * Gives bonus points for strategic positions
     */
    const getPositionalScore = (cellIndex: number): number => {
        const row = Math.floor(cellIndex / GRID_SIZE);
        const col = cellIndex % GRID_SIZE;
        const centerRow = Math.floor(GRID_SIZE / 2);
        const centerCol = Math.floor(GRID_SIZE / 2);

        // Distance from center (closer to center gets higher score)
        const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        return Math.max(0, 10 - distanceFromCenter * 2);
    };

    /**
     * Smart AI move selection
     */
    const makeAiMove = useCallback(() => {
        setTimeout(() => {
            setBoard(currentBoard => {
                const evaluations = evaluatePosition(currentBoard, 'O');

                if (evaluations.length > 0) {
                    // Add some randomness to make AI less predictable, but still prefer better moves
                    const bestScore = evaluations[0].score;
                    const goodMoves = evaluations.filter(move => move.score >= bestScore * 0.8);
                    const selectedMove = goodMoves[Math.floor(Math.random() * goodMoves.length)];

                    const newBoard = [...currentBoard];
                    newBoard[selectedMove.index] = 'O';
                    return newBoard;
                }
                return currentBoard;
            });
        }, 800); // Slightly longer delay to show AI is "thinking"
    }, [evaluatePosition]);

    // --- Effect Hook to check for win/draw and control game flow ---
    useEffect(() => {
        if (!isGameActive) return;

        const xCount = board.filter(c => c === 'X').length;
        const oCount = board.filter(c => c === 'O').length;

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

        if (nextPlayer === 'X') {
            setIsAiThinking(false);
        }
    }, [board, isGameActive, checkWin]);

    // --- Effect Hook for AI's turn ---
    useEffect(() => {
        if (gameMode === 'pva' && currentPlayer === 'O' && isGameActive && !isAiThinking) {
            setIsAiThinking(true);
            setStatus("AI is thinking...");
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
                            pointerEvents: isAiThinking ? 'none' : 'auto',
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