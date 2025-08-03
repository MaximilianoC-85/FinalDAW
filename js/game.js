/* js/game.js */
'use strict';

// Global game variables (now part of the GAME_STATE object)
var GAME_STATE = {
    board: [],
    rows: 0,
    cols: 0,
    mines: 0,
    revealedCells: 0,
    isGameOver: false,
    firstClick: true,
    timerInterval: null,
    elapsedTime: 0,
    score: 0,
    currentDifficulty: 'easy'
};

var DIFFICULTY_CONFIGURATIONS = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 12, cols: 12, mines: 25 },
    hard: { rows: 16, cols: 16, mines: 40 }
};

// 'game' object that will contain all exposed functions and variables
var game = {
    // Function to initialize the game
    initializeGame: function (difficulty) {
        var config = DIFFICULTY_CONFIGURATIONS[difficulty];
        if (!config) {
            return;
        }

        // Reset game state
        GAME_STATE.rows = config.rows;
        GAME_STATE.cols = config.cols;
        GAME_STATE.mines = config.mines;
        GAME_STATE.revealedCells = 0;
        GAME_STATE.isGameOver = false;
        GAME_STATE.firstClick = true;
        GAME_STATE.elapsedTime = 0;
        GAME_STATE.score = 0;
        GAME_STATE.currentDifficulty = difficulty;

        this.stopTimer();

        // Initialize board
        this.createBoard();
        this.renderBoard();

        // Update UI
        ui.updateMineCounterDisplay(GAME_STATE.mines);
        ui.updateTimerDisplay(GAME_STATE.elapsedTime);

    },

    // Function to create the board logic (mines, numbers)
    createBoard: function () {
        GAME_STATE.board = new Array(GAME_STATE.rows).fill(null).map(() => new Array(GAME_STATE.cols).fill(null).map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            questioned: false,
            adjacentMines: 0
        })));
    },

    // Renders the board on the screen
    renderBoard: function () {
        ui.renderBoard(GAME_STATE.board, GAME_STATE.rows, GAME_STATE.cols);
    },

    // Places mines on the board after the first click
    placeMines: function (firstClickRow, firstClickCol) {
        var minesPlaced = 0;
        while (minesPlaced < GAME_STATE.mines) {
            var randomRow = utils.getRandomNumber(0, GAME_STATE.rows - 1);
            var randomCol = utils.getRandomNumber(0, GAME_STATE.cols - 1);

            // Check if it's not a mine and not the first click cell or its neighbors
            if (!GAME_STATE.board[randomRow][randomCol].isMine &&
                (Math.abs(randomRow - firstClickRow) > 1 || Math.abs(randomCol - firstClickCol) > 1)) {
                GAME_STATE.board[randomRow][randomCol].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate adjacent mines for all non-mine cells
        this.calculateAdjacentMines();
    },

    // Calculates the number of adjacent mines for each cell
    calculateAdjacentMines: function () {
        for (var i = 0; i < GAME_STATE.rows; i++) {
            for (var j = 0; j < GAME_STATE.cols; j++) {
                if (!GAME_STATE.board[i][j].isMine) {
                    GAME_STATE.board[i][j].adjacentMines = this.countMinesAround(i, j);
                }
            }
        }
    },

    // Counts the number of mines around a specific cell
    countMinesAround: function (row, col) {
        var count = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = row + i;
                var newCol = col + j;
                if (this.isValidMove(newRow, newCol) && GAME_STATE.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    },

    // Handles the left-click on a cell
    handleLeftClick: function (event) {
        if (GAME_STATE.isGameOver) return;
        var row = parseInt(event.target.dataset.fila);
        var col = parseInt(event.target.dataset.columna);

        // Handle first click
        if (GAME_STATE.firstClick) {
            game.placeMines(row, col);
            game.startTimer();
            GAME_STATE.firstClick = false;
        }

        var cell = GAME_STATE.board[row][col];
        if (cell.revealed || cell.flagged || cell.questioned) return;

        game.revealCell(row, col);
    },

    // Handles the right-click on a cell (flags/questions)
    handleRightClick: function (event) {
        event.preventDefault();
        if (GAME_STATE.isGameOver) return;
        var row = parseInt(event.target.dataset.fila);
        var col = parseInt(event.target.dataset.columna);
        var cell = GAME_STATE.board[row][col];

        if (cell.revealed) return;

        // Cycle through flags
        if (!cell.flagged && !cell.questioned) {
            cell.flagged = true;
            ui.updateMineCounterDisplay(game.countRemainingMines());
        } else if (cell.flagged) {
            cell.flagged = false;
            cell.questioned = true;
            ui.updateMineCounterDisplay(game.countRemainingMines());
        } else if (cell.questioned) {
            cell.questioned = false;
        }

        ui.updateCellDisplay(row, col, cell);
    },

    // Reveals a cell and handles game logic
    revealCell: function (row, col) {
        if (!this.isValidMove(row, col)) return;
        var cell = GAME_STATE.board[row][col];

        if (cell.revealed || cell.flagged || cell.questioned) return;

        cell.revealed = true;
        GAME_STATE.revealedCells++;
        ui.updateCellDisplay(row, col, cell);

        if (cell.isMine) {
            this.gameOver(false);
            return;
        }

        if (cell.adjacentMines === 0) {
            this.expandEmptyCells(row, col);
        }

        // Add score for revealed cells that are not mines
        GAME_STATE.score++;

        this.checkWinCondition();
    },

    // Counts the flags around a specific cell
    countFlagsAround: function (row, col) {
        var count = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = row + i;
                var newCol = col + j;
                if (this.isValidMove(newRow, newCol) && GAME_STATE.board[newRow][newCol].flagged) {
                    count++;
                }
            }
        }
        return count;
    },

    // Expands empty cells recursively
    expandEmptyCells: function (row, col) {
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var newRow = row + i;
                var newCol = col + j;
                if (this.isValidMove(newRow, newCol) &&
                    !GAME_STATE.board[newRow][newCol].revealed &&
                    !GAME_STATE.board[newRow][newCol].isMine &&
                    !GAME_STATE.board[newRow][newCol].flagged) {
                    game.revealCell(newRow, newCol); // Call revealCell through the game object
                }
            }
        }
    },

    // Checks if the game is won
    checkWinCondition: function () {
        if (GAME_STATE.revealedCells === (GAME_STATE.rows * GAME_STATE.cols) - GAME_STATE.mines) {
            this.gameOver(true);
        }
    },

    // Handles the end of the game
    gameOver: function (didWin) {
        GAME_STATE.isGameOver = true;
        this.stopTimer();

        this.revealAllMines();

        var message;
        if (didWin) {
            message = '¡Has ganado! Tu puntaje es: ' + GAME_STATE.score;
            storage.saveGameResult(
                APP_STATE.playerName,
                GAME_STATE.score,
                GAME_STATE.elapsedTime,
                new Date()
            );
        } else {
            message = '¡Perdiste! Inténtalo de nuevo.';
            storage.saveGameResult(
                APP_STATE.playerName,
                GAME_STATE.score,
                GAME_STATE.elapsedTime,
                new Date()
            );
        }
        ui.showMessage(message);
    },

    // Reveals all mines on the board
    revealAllMines: function () {
        for (var i = 0; i < GAME_STATE.rows; i++) {
            for (var j = 0; j < GAME_STATE.cols; j++) {
                if (GAME_STATE.board[i][j].isMine) {
                    GAME_STATE.board[i][j].revealed = true;
                    ui.updateCellDisplay(i, j, GAME_STATE.board[i][j]);
                }
            }
        }
    },

    // Checks if a move is valid
    isValidMove: function (row, col) {
        return row >= 0 && row < GAME_STATE.rows && col >= 0 && col < GAME_STATE.cols;
    },

    // Starts the game timer
    startTimer: function () {
        if (GAME_STATE.timerInterval) {
            clearInterval(GAME_STATE.timerInterval);
        }
        GAME_STATE.timerInterval = setInterval(function () {
            GAME_STATE.elapsedTime++;
            ui.updateTimerDisplay(GAME_STATE.elapsedTime);
        }, 1000);
    },

    // Stops the game timer
    stopTimer: function () {
        if (GAME_STATE.timerInterval) {
            clearInterval(GAME_STATE.timerInterval);
            GAME_STATE.timerInterval = null;
        }
    },

    // Counts the number of remaining mines (total mines - flagged cells)
    countRemainingMines: function () {
        var flaggedCells = 0;
        for (var i = 0; i < GAME_STATE.rows; i++) {
            for (var j = 0; j < GAME_STATE.cols; j++) {
                if (GAME_STATE.board[i][j].flagged) {
                    flaggedCells++;
                }
            }
        }
        return GAME_STATE.mines - flaggedCells;
    },

    // Resets the game
    reset: function () {
        game.initializeGame(GAME_STATE.currentDifficulty);
    }
};
