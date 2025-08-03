/* js/main.js */
'use strict';

// Global variables for overall application state
var APP_STATE = {
    darkMode: false,
    playerName: ''
};

// Main initialization function
function init() {
    console.log('main.js: init() - Iniciando aplicación.');
    // 1. Initialize UI elements first
    ui.init(); // This will populate UI_ELEMENTS in ui.js and attach its listeners

    // 2. Initialize theme state from storage
    var savedTheme = storage.loadTheme();
    console.log('main.js: init() - Tema guardado en localStorage:', savedTheme);
    if (savedTheme === 'dark') {
        APP_STATE.darkMode = true;
        ui.toggleTheme(true);
    } else {
        APP_STATE.darkMode = false;
        ui.toggleTheme(false);
    }
    console.log('main.js: init() - Tema aplicado:', APP_STATE.darkMode ? 'oscuro' : 'claro');

    // 3. Set up global event listeners or those that coordinate modules
    setupGlobalEventListeners();

    // 4. Show modal for player to enter their name at the start (only on index.html)
    if (ui.getPlayerNameModal()) { // Check if the modal exists before showing it
        ui.showNameInputModal();
    }
    
    // 5. Handle the contact form submission on contact.html
    var contactForm = ui.getContactForm();
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// Function to set up all event listeners for the main app
function setupGlobalEventListeners() {
    console.log('main.js: setupGlobalEventListeners() - Configurando listeners globales.');

    // Event listener for theme button
    var themeButton = ui.getThemeButton();
    if (themeButton) {
        themeButton.addEventListener('click', function() {
            APP_STATE.darkMode = !APP_STATE.darkMode;
            storage.saveTheme(APP_STATE.darkMode ? 'dark' : 'light');
            ui.toggleTheme(APP_STATE.darkMode);
        });
    }

    // Event listener for restart button
    var restartButton = ui.getRestartButton();
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            game.reset();
        });
    }

    // Event listener for start game button in the name modal
    var startGameButton = ui.getStartGameButton();
    var playerNameInput = ui.getPlayerNameInput();
    if (startGameButton && playerNameInput) {
        startGameButton.addEventListener('click', function() {
            var name = playerNameInput.value;
            if (utils.validateName(name)) {
                APP_STATE.playerName = name;
                ui.hideNameInputModal();
                console.log('main.js: setupGlobalEventListeners() - Nombre de jugador establecido:', APP_STATE.playerName);
                game.initializeGame('easy');
            } else {
                ui.getNameError().textContent = 'El nombre debe ser alfanumérico y tener al menos 3 letras.';
            }
        });
    }
    
    // Event listener for difficulty button
    var difficultyButton = ui.getDifficultyButton();
    var closeDifficultyModal = ui.getCloseDifficultyModal();
    if (difficultyButton && closeDifficultyModal) {
        difficultyButton.addEventListener('click', function() {
            ui.showDifficultyModal();
        });
        closeDifficultyModal.addEventListener('click', function() {
            ui.hideDifficultyModal();
        });
    }

    // Event listeners for difficulty options
    var difficultyButtons = ui.getDifficultyButtons();
    if (difficultyButtons) {
        difficultyButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var newDifficulty = button.dataset.difficulty;
                game.initializeGame(newDifficulty);
                ui.hideDifficultyModal();
            });
        });
    }

    // Event listener for game over modal close button
    var closeGameOverModal = ui.getCloseGameOverModal();
    if (closeGameOverModal) {
        closeGameOverModal.addEventListener('click', function() {
            ui.hideGameOverModal();
        });
    }

    // Event listener for ranking button
    var rankingButton = ui.getRankingButton();
    if (rankingButton) {
        rankingButton.addEventListener('click', function() {
            var rankingData = storage.loadGameResults();
            ui.renderRanking(rankingData);
            ui.showRankingModal();
        });
    }
    
    // Event listener for sorting ranking by score
    var sortByScoreButton = ui.getSortByScore();
    if (sortByScoreButton) {
        sortByScoreButton.addEventListener('click', function() {
            var rankingData = storage.loadGameResults();
            var sortedRanking = utils.sortRanking(rankingData, 'score');
            ui.renderRanking(sortedRanking);
        });
    }

    // Event listener for sorting ranking by date
    var sortByDateButton = ui.getSortByDate();
    if (sortByDateButton) {
        sortByDateButton.addEventListener('click', function() {
            var rankingData = storage.loadGameResults();
            var sortedRanking = utils.sortRanking(rankingData, 'date');
            ui.renderRanking(sortedRanking);
        });
    }
      var closeRankingModal = ui.getCloseRankingModal();
    if (closeRankingModal) {
        closeRankingModal.addEventListener('click', function() {
            ui.hideRankingModal();
        });
    }

}

// Handles contact form submission
function handleContactFormSubmit(event) {
    event.preventDefault();
    console.log('main.js: handleContactFormSubmit() - Procesando formulario de contacto.');

    var name = ui.getContactNameInput().value;
    var email = ui.getContactEmailInput().value;
    var message = ui.getContactMessageInput().value;

    var isNameValid = utils.validateName(name);
    var isEmailValid = utils.validateEmail(email);
    var isMessageValid = utils.validateMessage(message);

    document.getElementById('contactNameError').textContent = '';
    document.getElementById('contactEmailError').textContent = '';
    document.getElementById('contactMessageError').textContent = '';

    if (!isNameValid) {
        document.getElementById('contactNameError').textContent = 'El nombre debe ser alfanumérico y tener al menos 3 letras.';
    }
    if (!isEmailValid) {
        document.getElementById('contactEmailError').textContent = 'Por favor, introduce un email válido.';
    }
    if (!isMessageValid) {
        document.getElementById('contactMessageError').textContent = 'El mensaje debe tener más de 5 caracteres.';
    }

    if (isNameValid && isEmailValid && isMessageValid) {
        // Open the default email client
        var subject = encodeURIComponent('Mensaje desde Buscaminas');
        var body = encodeURIComponent('Nombre: ' + name + '\nEmail: ' + email + '\nMensaje: ' + message);
        window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
        // Optional: clear the form after sending
        ui.getContactForm().reset();
        console.log('main.js: Formulario de contacto válido. Abriendo cliente de email.');
    } else {
        console.log('main.js: Formulario de contacto inválido.');
    }
}

// Ensure init runs after the DOM is fully loaded
window.onload = init;
