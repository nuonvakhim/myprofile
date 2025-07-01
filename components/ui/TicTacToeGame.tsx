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
     * Advanced board evaluation function
     */
    const evaluateBoard = useCallback((board: string[], player: 'X' | 'O'): number => {
        const opponent = player === 'X' ? 'O' : 'X';

        // Check for immediate win/loss
        if (checkWin(player, board)) return 10000;
        if (checkWin(opponent, board)) return -10000;

        let score = 0;

        // Evaluate all possible lines
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Check all four directions
                const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

                for (const [dr, dc] of directions) {
                    if (r + (WIN_LENGTH - 1) * dr >= 0 && r + (WIN_LENGTH - 1) * dr < GRID_SIZE &&
                        c + (WIN_LENGTH - 1) * dc >= 0 && c + (WIN_LENGTH - 1) * dc < GRID_SIZE) {

                        const line = Array.from({ length: WIN_LENGTH }, (_, i) =>
                            (r + i * dr) * GRID_SIZE + (c + i * dc)
                        );

                        score += evaluateLine(line, board, player);
                    }
                }
            }
        }

        return score;
    }, [checkWin]);

    /**
     * Evaluates a single line for potential
     */
    const evaluateLine = (line: number[], board: string[], player: 'X' | 'O'): number => {
        const opponent = player === 'X' ? 'O' : 'X';
        let playerCount = 0;
        let opponentCount = 0;
        let emptyCount = 0;

        for (const index of line) {
            if (board[index] === player) playerCount++;
            else if (board[index] === opponent) opponentCount++;
            else emptyCount++;
        }

        // If opponent has pieces in this line, it's not useful for us
        if (opponentCount > 0 && playerCount > 0) return 0;

        // Score based on potential
        if (playerCount === 4) return 10000;
        if (playerCount === 3 && emptyCount === 1) return 500;
        if (playerCount === 2 && emptyCount === 2) return 50;
        if (playerCount === 1 && emptyCount === 3) return 5;

        // Penalize opponent potential
        if (opponentCount === 4) return -10000;
        if (opponentCount === 3 && emptyCount === 1) return -400;
        if (opponentCount === 2 && emptyCount === 2) return -40;
        if (opponentCount === 1 && emptyCount === 3) return -4;

        return 0;
    };

    /**
     * Minimax algorithm with alpha-beta pruning for optimal AI moves
     */
    const minimax = useCallback((
        board: string[],
        depth: number,
        isMaximizing: boolean,
        alpha: number,
        beta: number,
        player: 'X' | 'O'
    ): { score: number, move?: number } => {
        const currentPlayer = isMaximizing ? player : (player === 'X' ? 'O' : 'X');
        const boardScore = evaluateBoard(board, player);

        // Terminal conditions
        if (Math.abs(boardScore) >= 10000 || depth === 0 || !board.includes('')) {
            return { score: boardScore - (isMaximizing ? depth : -depth) }; // Prefer quicker wins/slower losses
        }

        const availableMoves = board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null) as number[];

        let bestMove = availableMoves[0];

        if (isMaximizing) {
            let maxScore = -Infinity;

            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = currentPlayer;

                const { score } = minimax(newBoard, depth - 1, false, alpha, beta, player);

                if (score > maxScore) {
                    maxScore = score;
                    bestMove = move;
                }

                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }

            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;

            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = currentPlayer;

                const { score } = minimax(newBoard, depth - 1, true, alpha, beta, player);

                if (score < minScore) {
                    minScore = score;
                    bestMove = move;
                }

                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }

            return { score: minScore, move: bestMove };
        }
    }, [evaluateBoard]);

    /**
     * Gets the optimal move using iterative deepening
     */
    const getBestMove = useCallback((board: string[]): number => {
        const availableMoves = board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null) as number[];

        if (availableMoves.length === 0) return -1;

        // Use iterative deepening to get the best move within time constraints
        let bestMove = availableMoves[0];
        let maxDepth = Math.min(8, availableMoves.length); // Adjust depth based on game state

        // For early game, use opening book strategies
        if (availableMoves.length >= GRID_SIZE * GRID_SIZE - 4) {
            // Prefer center positions in early game
            const centerPositions = [];
            const mid = Math.floor(GRID_SIZE / 2);
            for (let r = mid - 1; r <= mid + 1; r++) {
                for (let c = mid - 1; c <= mid + 1; c++) {
                    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                        const pos = r * GRID_SIZE + c;
                        if (availableMoves.includes(pos)) {
                            centerPositions.push(pos);
                        }
                    }
                }
            }
            if (centerPositions.length > 0) {
                return centerPositions[Math.floor(Math.random() * centerPositions.length)];
            }
        }

        // Use minimax for strategic play
        for (let depth = 1; depth <= maxDepth; depth++) {
            const result = minimax(board, depth, true, -Infinity, Infinity, 'O');
            if (result.move !== undefined) {
                bestMove = result.move;
            }

            // If we found a winning move, no need to search deeper
            if (result.score >= 10000) break;
        }

        return bestMove;
    }, [minimax]);



    /**
     * Ultra-smart AI move selection using minimax
     */
    const makeAiMove = useCallback(() => {
        setTimeout(() => {
            setBoard(currentBoard => {
                const bestMove = getBestMove(currentBoard);

                if (bestMove !== -1) {
                    const newBoard = [...currentBoard];
                    newBoard[bestMove] = 'O';
                    return newBoard;
                }
                return currentBoard;
            });
        }, 1200); // Longer delay to show AI is doing deep thinking
    }, [getBestMove]);

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