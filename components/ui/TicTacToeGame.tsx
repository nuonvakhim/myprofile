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

    // --- Memoization cache for minimax ---
    const minimaxCache = React.useRef(new Map<string, { score: number; index: number | null }>());

    // --- Game Logic Functions ---

    const startGame = (mode: 'pvp' | 'pva') => {
        setGameMode(mode);
        setIsGameActive(true);
        setStatus("Player X's turn");
    };

    const handleRestartGame = (preserveMode: boolean = false) => {
        setBoard(Array(GRID_SIZE * GRID_SIZE).fill(''));
        setCurrentPlayer('X');
        setWinningLine(null);
        setIsAiThinking(false);
        if (preserveMode && gameMode) {
            setIsGameActive(true);
            setStatus("Player X's turn");
            // gameMode stays the same
        } else {
            setIsGameActive(false);
            setStatus("Select a game mode");
            setGameMode(null);
        }
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
     * Enhanced heuristic: counts open lines, blocks, and double threats, and penalizes imminent human wins
     */
    const enhancedHeuristic = (currentBoard: string[], player: 'X' | 'O'): number => {
        // Use your existing evaluatePosition for base score
        const base = evaluatePosition(currentBoard, player);
        let score = base.length > 0 ? base[0].score : 0;
        // Bonus for double threats (two or more winning moves next turn)
        let doubleThreats = 0;
        for (const move of currentBoard.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null) as number[]) {
            const testBoard = [...currentBoard];
            testBoard[move] = player;
            if (checkWin(player, testBoard)) doubleThreats++;
        }
        score += doubleThreats >= 2 ? 500 : 0;

        // --- Defensive: Penalize imminent human wins and multiple threats ---
        // 1. Penalize if human ('X') has three in a row with an open fourth
        const GRID_CELLS = GRID_SIZE * GRID_SIZE;
        const WIN_NEAR = WIN_LENGTH - 1;
        let humanThreats = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Horizontal
                if (c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => r * GRID_SIZE + c + i);
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === WIN_NEAR && emptyCount === 1 && oCount === 0) humanThreats++;
                }
                // Vertical
                if (r + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + c);
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === WIN_NEAR && emptyCount === 1 && oCount === 0) humanThreats++;
                }
                // Diagonal (top-left to bottom-right)
                if (r + WIN_LENGTH <= GRID_SIZE && c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c + i));
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === WIN_NEAR && emptyCount === 1 && oCount === 0) humanThreats++;
                }
                // Diagonal (top-right to bottom-left)
                if (r + WIN_LENGTH <= GRID_SIZE && c - WIN_LENGTH + 1 >= 0) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c - i));
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === WIN_NEAR && emptyCount === 1 && oCount === 0) humanThreats++;
                }
            }
        }
        // Heavily penalize imminent human wins
        score -= humanThreats * 2000;

        // 2. Penalize multiple two-in-a-row threats by human
        let twoThreats = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                // Horizontal
                if (c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => r * GRID_SIZE + c + i);
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === 2 && emptyCount === WIN_LENGTH - 2 && oCount === 0) twoThreats++;
                }
                // Vertical
                if (r + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + c);
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === 2 && emptyCount === WIN_LENGTH - 2 && oCount === 0) twoThreats++;
                }
                // Diagonal (top-left to bottom-right)
                if (r + WIN_LENGTH <= GRID_SIZE && c + WIN_LENGTH <= GRID_SIZE) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c + i));
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === 2 && emptyCount === WIN_LENGTH - 2 && oCount === 0) twoThreats++;
                }
                // Diagonal (top-right to bottom-left)
                if (r + WIN_LENGTH <= GRID_SIZE && c - WIN_LENGTH + 1 >= 0) {
                    const line = Array.from({ length: WIN_LENGTH }, (_, i) => (r + i) * GRID_SIZE + (c - i));
                    const xCount = line.filter(idx => currentBoard[idx] === 'X').length;
                    const oCount = line.filter(idx => currentBoard[idx] === 'O').length;
                    const emptyCount = line.filter(idx => currentBoard[idx] === '').length;
                    if (xCount === 2 && emptyCount === WIN_LENGTH - 2 && oCount === 0) twoThreats++;
                }
            }
        }
        score -= twoThreats * 200;

        return score;
    };

    /**
     * Minimax algorithm with alpha-beta pruning, memoization, and move ordering
     */
    const minimax = (
        currentBoard: string[],
        depth: number,
        isMaximizing: boolean,
        alpha: number,
        beta: number
    ): { score: number; index: number | null } => {
        // Memoization key
        const key = currentBoard.join('') + (isMaximizing ? 'O' : 'X') + depth;
        if (minimaxCache.current.has(key)) return minimaxCache.current.get(key)!;

        // Terminal states
        const xWin = checkWin('X', currentBoard);
        const oWin = checkWin('O', currentBoard);
        if (oWin) return { score: 10000 - depth, index: null };
        if (xWin) return { score: -10000 + depth, index: null };
        if (!currentBoard.includes('')) return { score: 0, index: null };
        if (depth === 0) {
            const evalScore = enhancedHeuristic(currentBoard, 'O');
            return { score: evalScore, index: null };
        }

        // Move ordering: sort by best heuristic for current player
        const availableCells = currentBoard
            .map((cell, idx) => (cell === '' ? idx : null))
            .filter(idx => idx !== null) as number[];
        const orderedMoves = availableCells
            .map(idx => {
                const testBoard = [...currentBoard];
                testBoard[idx] = isMaximizing ? 'O' : 'X';
                return { idx, score: enhancedHeuristic(testBoard, isMaximizing ? 'O' : 'X') };
            })
            .sort((a, b) => isMaximizing ? b.score - a.score : a.score - b.score)
            .map(m => m.idx);

        let bestIndex: number | null = null;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const idx of orderedMoves) {
                const newBoard = [...currentBoard];
                newBoard[idx] = 'O';
                // Early win cutoff
                if (checkWin('O', newBoard)) {
                    minimaxCache.current.set(key, { score: 10000 - depth, index: idx });
                    return { score: 10000 - depth, index: idx };
                }
                const evalResult = minimax(newBoard, depth - 1, false, alpha, beta).score;
                if (evalResult > maxEval) {
                    maxEval = evalResult;
                    bestIndex = idx;
                }
                alpha = Math.max(alpha, evalResult);
                if (beta <= alpha) break;
            }
            const result = { score: maxEval, index: bestIndex };
            minimaxCache.current.set(key, result);
            return result;
        } else {
            let minEval = Infinity;
            for (const idx of orderedMoves) {
                const newBoard = [...currentBoard];
                newBoard[idx] = 'X';
                // Early block cutoff
                if (checkWin('X', newBoard)) {
                    minimaxCache.current.set(key, { score: -10000 + depth, index: idx });
                    return { score: -10000 + depth, index: idx };
                }
                const evalResult = minimax(newBoard, depth - 1, true, alpha, beta).score;
                if (evalResult < minEval) {
                    minEval = evalResult;
                    bestIndex = idx;
                }
                beta = Math.min(beta, evalResult);
                if (beta <= alpha) break;
            }
            const result = { score: minEval, index: bestIndex };
            minimaxCache.current.set(key, result);
            return result;
        }
    };

    /**
     * Checks if the opponent can win in their next move and returns the blocking index if so
     */
    const findImmediateBlock = (currentBoard: string[], opponent: 'X' | 'O'): number | null => {
        for (const idx of currentBoard.map((cell, i) => cell === '' ? i : null).filter(i => i !== null) as number[]) {
            const testBoard = [...currentBoard];
            testBoard[idx] = opponent;
            if (checkWin(opponent, testBoard)) {
                return idx;
            }
        }
        return null;
    };

    /**
     * Smart AI move selection using enhanced minimax, with pre-move block scan
     */
    const makeAiMove = useCallback(() => {
        setTimeout(() => {
            setBoard(currentBoard => {
                // Clear cache for each new move
                minimaxCache.current.clear();
                // 1. Block human win if possible
                const blockIdx = findImmediateBlock(currentBoard, 'X');
                if (blockIdx !== null && currentBoard[blockIdx] === '') {
                    const newBoard = [...currentBoard];
                    newBoard[blockIdx] = 'O';
                    return newBoard;
                }
                // 2. Otherwise, play best move
                const depth = 4; // Try 4 for more strength, lower if slow
                const { index } = minimax(currentBoard, depth, true, -Infinity, Infinity);
                if (index !== null && currentBoard[index] === '') {
                    const newBoard = [...currentBoard];
                    newBoard[index] = 'O';
                    return newBoard;
                }
                return currentBoard;
            });
        }, 400); // Faster AI response
    }, [minimax]);

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

    // --- Effect Hook to auto-restart after win/draw ---
    useEffect(() => {
        if (!isGameActive && (status.includes('Wins') || status.includes('Draw'))) {
            const timeout = setTimeout(() => {
                handleRestartGame(true); // preserve game mode
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isGameActive, status]);

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
                        <button onClick={() => handleRestartGame()} className="pixel-button">
                            Restart
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TicTacToeGame;