/* js/ui.js */
'use strict';

// Global variables for specific UI DOM elements
var UI_ELEMENTS = {
    gameBoard: null,
    minesCounter: null,
    timer: null,
    playerNameModal: null,
    playerNameInput: null,
    startGameButton: null,
    nameError: null,
    difficultyModal: null,
    closeDifficultyModal: null,
    difficultyButtons: null,
    gameOverModal: null,
    closeGameOverModal: null,
    gameOverMessage: null,
    rankingModal: null,
    closeRankingModal: null,
    rankingList: null,
    sortByScore: null,
    sortByDate: null,
    restartButton: null,
    themeButton: null,
    difficultyButton: null,
    rankingButton: null,
};

// UI initialization function
function initUiElements() {
    console.log('ui.js: initUiElements() - Obteniendo referencias DOM.');
    // Get all DOM element references
    // A check is added to ensure the element exists before assigning it
    UI_ELEMENTS.gameBoard = document.getElementById('gameBoard');
    UI_ELEMENTS.minesCounter = document.getElementById('minesCounter');
    UI_ELEMENTS.timer = document.getElementById('timer');
    UI_ELEMENTS.playerNameModal = document.getElementById('playerNameModal');
    UI_ELEMENTS.playerNameInput = document.getElementById('playerNameInput');
    UI_ELEMENTS.startGameButton = document.getElementById('startGameButton');
    UI_ELEMENTS.nameError = document.getElementById('nameError');
    UI_ELEMENTS.difficultyModal = document.getElementById('difficultyModal');
    UI_ELEMENTS.closeDifficultyModal = document.getElementById('closeDifficultyModal');
    UI_ELEMENTS.difficultyButtons = document.querySelectorAll('.difficulty-option-button');
    UI_ELEMENTS.gameOverModal = document.getElementById('gameOverModal');
    UI_ELEMENTS.closeGameOverModal = document.getElementById('closeGameOverModal');
    UI_ELEMENTS.gameOverMessage = document.getElementById('gameOverMessage');
    UI_ELEMENTS.rankingModal = document.getElementById('rankingModal');
    UI_ELEMENTS.closeRankingModal = document.getElementById('closeRankingModal');
    UI_ELEMENTS.rankingList = document.getElementById('rankingList');
    UI_ELEMENTS.sortByScore = document.getElementById('sortByScore');
    UI_ELEMENTS.sortByDate = document.getElementById('sortByDate');
    UI_ELEMENTS.restartButton = document.getElementById('restartButton');
    UI_ELEMENTS.themeButton = document.getElementById('themeButton');
    UI_ELEMENTS.difficultyButton = document.getElementById('difficultyButton');
    UI_ELEMENTS.rankingButton = document.getElementById('rankingButton');
}

// Renders the board in the DOM
function renderBoard(board, rows, cols) {
    if (!UI_ELEMENTS.gameBoard) {
        return;
    }
    UI_ELEMENTS.gameBoard.innerHTML = '';
    UI_ELEMENTS.gameBoard.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.fila = i;
            cell.dataset.columna = j;
            cell.addEventListener('click', game.handleLeftClick);
            cell.addEventListener('contextmenu', game.handleRightClick);
            UI_ELEMENTS.gameBoard.appendChild(cell);
        }
    }
}

// Updates the display of a cell
function updateCellDisplay(row, col, cell) {
    var cellElement = document.querySelector('.cell[data-fila="' + row + '"][data-columna="' + col + '"]');
    if (!cellElement) {
        return;
    }

    // Remove all state classes to avoid duplicates
    cellElement.classList.remove('revealed', 'flag', 'question', 'mine');

    // Apply state classes and content
    if (cell.revealed) {
        cellElement.classList.add('revealed');
        if (cell.isMine) {
            cellElement.classList.add('mine');
            cellElement.innerHTML = '💣';
        } else if (cell.adjacentMines > 0) {
            cellElement.innerHTML = cell.adjacentMines;
            cellElement.classList.add('mines-' + cell.adjacentMines);
        } else {
            cellElement.innerHTML = '';
        }
    } else {
        if (cell.flagged) {
            cellElement.classList.add('flag');
            cellElement.innerHTML = '🚩';
        } else if (cell.questioned) {
            cellElement.classList.add('question');
            cellElement.innerHTML = '?';
        } else {
            cellElement.innerHTML = '';
        }
    }
}

// Shows messages to the player
function showMessage(message) {
    if (!UI_ELEMENTS.gameOverMessage || !UI_ELEMENTS.gameOverModal) {
        return;
    }
    UI_ELEMENTS.gameOverMessage.textContent = message;
    UI_ELEMENTS.gameOverModal.style.display = 'flex';
}

// Hides the game over modal
function hideGameOverModal() {
    if (!UI_ELEMENTS.gameOverModal) {
        return;
    }
    UI_ELEMENTS.gameOverModal.style.display = 'none';
}

// Shows the player name input modal
function showNameInputModal() {
    if (!UI_ELEMENTS.playerNameModal) {
        return;
    }
    UI_ELEMENTS.playerNameModal.style.display = 'flex';
}

// Hides the player name input modal
function hideNameInputModal() {
    if (!UI_ELEMENTS.playerNameModal) {
        return;
    }
    UI_ELEMENTS.playerNameModal.style.display = 'none';
}

// Shows the difficulty selection modal
function showDifficultyModal() {
    if (!UI_ELEMENTS.difficultyModal) {
        return;
    }
    UI_ELEMENTS.difficultyModal.style.display = 'flex';
}

// Hides the difficulty selection modal
function hideDifficultyModal() {
    if (!UI_ELEMENTS.difficultyModal) {
        return;
    }
    UI_ELEMENTS.difficultyModal.style.display = 'none';
}

// Shows the ranking modal
function showRankingModal() {
    if (!UI_ELEMENTS.rankingModal) {
        return;
    }
    UI_ELEMENTS.rankingModal.style.display = 'flex';
}

// Hides the ranking modal
function hideRankingModal() {
    if (!UI_ELEMENTS.rankingModal) {
        return;
    }
    UI_ELEMENTS.rankingModal.style.display = 'none';
}


// Renders the ranking list in the modal
function renderRanking(rankingData) {
    var listElement = UI_ELEMENTS.rankingList;
    if (!listElement) {
        return;
    }
    listElement.innerHTML = '';

    if (rankingData.length === 0) {
        var noResultsItem = document.createElement('li');
        noResultsItem.textContent = 'No hay resultados para mostrar.';
        listElement.appendChild(noResultsItem);
        return;
    }

    // Use the correct property names (name, score, duration, date)
    rankingData.forEach(function(result, index) {
        var listItem = document.createElement('li');
        var date = result.date ? new Date(result.date) : null;
        var formattedDate = date && !isNaN(date) ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString() : 'Fecha no disponible';

        listItem.innerHTML = '<strong>' + (index + 1) + '. ' + result.name + '</strong> - Puntaje: ' + result.score + ' - Tiempo: ' + result.duration + 's - Fecha: ' + formattedDate;
        listElement.appendChild(listItem);
    });
}


// Updates the mine counter display on the UI
function updateMineCounterDisplay(remainingMines) {
    if (UI_ELEMENTS.minesCounter) {
        var displayValue = remainingMines.toString().padStart(3, '0');
        UI_ELEMENTS.minesCounter.textContent = displayValue;
    }
}

// Updates the timer display on the UI
function updateTimerDisplay(seconds) {
    if (UI_ELEMENTS.timer) {
        var minutes = Math.floor(seconds / 60);
        var sec = seconds % 60;
        var displayValue = String(minutes).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        UI_ELEMENTS.timer.textContent = displayValue;
    }
}

// Toggles the application theme (dark/light)
function toggleTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    UI_ELEMENTS.themeButton.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
}

// Expose getters so main.js can access DOM elements
function getRestartButton() { return UI_ELEMENTS.restartButton; }
function getThemeButton() { return UI_ELEMENTS.themeButton; }
function getDifficultyButton() { return UI_ELEMENTS.difficultyButton; }
function getRankingButton() { return UI_ELEMENTS.rankingButton; }
function getCloseRankingModal() {return UI_ELEMENTS.closeRankingModal}
function getPlayerNameInput() { return UI_ELEMENTS.playerNameInput; }
function getStartGameButton() { return UI_ELEMENTS.startGameButton; }
function getNameError() { return UI_ELEMENTS.nameError; }
function getCloseDifficultyModal() { return UI_ELEMENTS.closeDifficultyModal; }
function getDifficultyButtons() { return UI_ELEMENTS.difficultyButtons; }
function getCloseGameOverModal() { return UI_ELEMENTS.closeGameOverModal; }
function getPlayerNameModal() { return UI_ELEMENTS.playerNameModal; }
function getSortByScore() { return UI_ELEMENTS.sortByScore; }
function getSortByDate() { return UI_ELEMENTS.sortByDate; }
function getGameBoard() { return UI_ELEMENTS.gameBoard; }
function getContactForm() { return document.getElementById('contactForm'); }
function getContactNameInput() { return document.getElementById('contactName'); }
function getContactEmailInput() { return document.getElementById('contactEmail'); }
function getContactMessageInput() { return document.getElementById('contactMessage'); }


// Expose public functions
var ui = {
    init: initUiElements,
    renderBoard: renderBoard,
    updateCellDisplay: updateCellDisplay,
    showMessage: showMessage,
    hideGameOverModal: hideGameOverModal,
    showNameInputModal: showNameInputModal,
    hideNameInputModal: hideNameInputModal,
    showDifficultyModal: showDifficultyModal,
    hideDifficultyModal: hideDifficultyModal,
    showRankingModal: showRankingModal,
    hideRankingModal: hideRankingModal,
    renderRanking: renderRanking,
    updateMineCounterDisplay: updateMineCounterDisplay,
    updateTimerDisplay: updateTimerDisplay,
    toggleTheme: toggleTheme,
    // Expose getters so main.js can access DOM elements
    getRestartButton: getRestartButton,
    getThemeButton: getThemeButton,
    getDifficultyButton: getDifficultyButton,
    getRankingButton: getRankingButton,
    getCloseRankingModal: getCloseRankingModal,
    getPlayerNameInput: getPlayerNameInput,
    getStartGameButton: getStartGameButton,
    getNameError: getNameError,
    getCloseDifficultyModal: getCloseDifficultyModal,
    getDifficultyButtons: getDifficultyButtons,
    getCloseGameOverModal: getCloseGameOverModal,
    getPlayerNameModal: getPlayerNameModal,
    getSortByScore: getSortByScore,
    getSortByDate: getSortByDate,
    getContactForm: getContactForm,
    getContactNameInput: getContactNameInput,
    getContactEmailInput: getContactEmailInput,
    getContactMessageInput: getContactMessageInput
};
