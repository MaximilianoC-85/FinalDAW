/* js/main.js */
'use strict';

// Variables globales para el estado general de la aplicación
var ESTADO_APP = {
    modoOscuro: false,
    nombreJugador: ''
};

// Función de inicialización principal
function init() {
    console.log('main.js: init() - Iniciando aplicación.');
    // 1. Inicializar los elementos de la UI primero
    ui.init(); // Esto poblará UI_ELEMENTS en ui.js y adjuntará sus listeners

    // 2. Inicializar el estado del tema desde el almacenamiento
    var temaGuardado = storage.cargarTema();
    console.log('main.js: init() - Tema guardado en localStorage:', temaGuardado);
    if (temaGuardado === 'oscuro') {
        ESTADO_APP.modoOscuro = true;
        ui.toggleTheme(true);
    } else {
        ESTADO_APP.modoOscuro = false;
        ui.toggleTheme(false);
    }
    console.log('main.js: init() - Tema aplicado:', ESTADO_APP.modoOscuro ? 'oscuro' : 'claro');

    // 3. Configurar manejadores de eventos globales o que coordinan módulos
    setupGlobalEventListeners();

    // 4. Mostrar modal para que el jugador ingrese su nombre al inicio (solo en index.html)
    if (ui.getModalNombreJugador()) { // Verificar si el modal existe antes de mostrarlo
        ui.showNameInputModal();
    }

    // 5. Inicializar el juego con la dificultad por defecto (fácil) (solo en index.html)
    if (ui.getTableroJuego()) { // Verificar si el tablero existe antes de inicializar el juego
        game.initializeGame('facil');
    }
}

// Función para configurar event listeners globales o de coordinación
function setupGlobalEventListeners() {
    console.log('main.js: setupGlobalEventListeners() - Configurando listeners.');
    // Evento para el botón de reiniciar (coordinación entre UI y Game)
    var botonReiniciar = ui.getBotonReiniciar();
    if (botonReiniciar) {
        botonReiniciar.addEventListener('click', handleReiniciarJuego);
        console.log('main.js: Listener para botonReiniciar adjuntado.');
    }

    // Evento para el botón de tema (coordinación entre UI y Storage)
    var botonTema = ui.getBotonTema();
    if (botonTema) {
        botonTema.addEventListener('click', handleToggleTema);
        console.log('main.js: Listener para botonTema adjuntado.');
    }

    // Evento para el botón de dificultad (coordinación entre UI y Game)
    var botonDificultad = ui.getBotonDificultad();
    if (botonDificultad) {
        botonDificultad.addEventListener('click', handleMostrarDificultad);
        console.log('main.js: Listener para botonDificultad adjuntado.');
    }

    // Evento para el botón de ranking (coordinación entre UI y Storage)
    var botonRanking = ui.getBotonRanking();
    if (botonRanking) {
        botonRanking.addEventListener('click', handleMostrarRanking);
        console.log('main.js: Listener para botonRanking adjuntado.');
    }

    // Eventos del modal de nombre de jugador (coordinación entre UI y App State)
    var botonIniciarPartida = ui.getBotonIniciarPartida();
    var inputNombreJugador = ui.getInputNombreJugador();
    if (botonIniciarPartida && inputNombreJugador) {
        botonIniciarPartida.addEventListener('click', handleIniciarPartida);
        inputNombreJugador.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) { // Tecla Enter
                handleIniciarPartida();
            }
        });
        console.log('main.js: Listeners para modalNombreJugador adjuntados.');
    }

    // Eventos del modal de dificultad
    var cerrarModalDificultad = ui.getCerrarModalDificultad();
    var botonesDificultad = ui.getBotonesDificultad();
    if (cerrarModalDificultad) {
        cerrarModalDificultad.addEventListener('click', ui.hideDifficultyModal);
        console.log('main.js: Listener para cerrarModalDificultad adjuntado.');
    }
    if (botonesDificultad) {
        var i;
        for (i = 0; i < botonesDificultad.length; i++) {
            botonesDificultad[i].addEventListener('click', handleSeleccionarDificultad);
        }
        console.log('main.js: Listeners para botonesDificultad adjuntados.');
    }

    // Eventos del modal de fin de juego
    var cerrarModalFinJuego = ui.getCerrarModalFinJuego();
    if (cerrarModalFinJuego) {
        cerrarModalFinJuego.addEventListener('click', ui.hideGameOverModal);
        console.log('main.js: Listener para cerrarModalFinJuego adjuntado.');
    }

    // Eventos del modal de ranking
    var cerrarModalRanking = ui.getCerrarModalRanking();
    var ordenarPorPuntaje = ui.getOrdenarPorPuntaje();
    var ordenarPorFecha = ui.getOrdenarPorFecha();
    if (cerrarModalRanking) {
        cerrarModalRanking.addEventListener('click', ui.hideRankingModal);
        console.log('main.js: Listener para cerrarModalRanking adjuntado.');
    }
    if (ordenarPorPuntaje) {
        ordenarPorPuntaje.addEventListener('click', function() {
            var ranking = storage.loadGameResults();
            ui.renderRanking(utils.sortRanking(ranking, 'puntaje'));
        });
        console.log('main.js: Listener para ordenarPorPuntaje adjuntado.');
    }
    if (ordenarPorFecha) {
        ordenarPorFecha.addEventListener('click', function() {
            var ranking = storage.loadGameResults();
            ui.renderRanking(utils.sortRanking(ranking, 'fecha'));
        });
        console.log('main.js: Listener para ordenarPorFecha adjuntado.');
    }

    // Eventos para el formulario de contacto (si existe en la página actual)
    var formularioContacto = document.getElementById('formularioContacto');
    if (formularioContacto) {
        formularioContacto.addEventListener('submit', handleEnviarContacto);
        console.log('main.js: Listener para formularioContacto adjuntado.');
    }

    // Evento para la barra espaciadora (reiniciar juego) - solo si el tablero existe
    if (ui.getTableroJuego()) {
        document.addEventListener('keydown', function(event) {
            if (event.keyCode === 32) { // Tecla Espacio
                event.preventDefault(); // Prevenir el scroll de la página
                handleReiniciarJuego();
            }
        });
        console.log('main.js: Listener para barra espaciadora adjuntado.');
    }
}

// Manejador para reiniciar el juego
function handleReiniciarJuego() {
    console.log('main.js: handleReiniciarJuego() - Reiniciando juego.');
    game.initializeGame(game.obtenerDificultadActual()); // Reinicia con la dificultad actual
    ui.hideGameOverModal(); // Asegurarse de que el modal de fin de juego esté oculto
}

// Manejador para alternar el tema (oscuro/claro)
function handleToggleTema() {
    console.log('main.js: handleToggleTema() - Alternando tema.');
    ESTADO_APP.modoOscuro = !ESTADO_APP.modoOscuro;
    ui.toggleTheme(ESTADO_APP.modoOscuro);
    storage.guardarTema(ESTADO_APP.modoOscuro ? 'oscuro' : 'claro');
    console.log('main.js: Tema guardado en localStorage:', ESTADO_APP.modoOscuro ? 'oscuro' : 'claro');
}

// Manejador para mostrar el modal de dificultad
function handleMostrarDificultad() {
    console.log('main.js: handleMostrarDificultad() - Mostrando modal de dificultad.');
    ui.showDifficultyModal();
}

// Manejador para seleccionar la dificultad
function handleSeleccionarDificultad(event) {
    var dificultad = event.target.getAttribute('data-dificultad');
    console.log('main.js: handleSeleccionarDificultad() - Dificultad seleccionada:', dificultad);
    game.initializeGame(dificultad);
    ui.hideDifficultyModal();
}

// Manejador para mostrar el ranking
function handleMostrarRanking() {
    console.log('main.js: handleMostrarRanking() - Mostrando ranking.');
    var ranking = storage.loadGameResults();
    ui.renderRanking(utils.sortRanking(ranking, 'puntaje')); // Mostrar por puntaje por defecto
    ui.showRankingModal();
}

// Manejador para iniciar la partida desde el modal de nombre
function handleIniciarPartida() {
    console.log('main.js: handleIniciarPartida() - Iniciando partida.');
    var nombre = ui.getInputNombreJugador().value;
    if (utils.validateName(nombre)) {
        ESTADO_APP.nombreJugador = nombre;
        ui.hideNameInputModal();
        console.log('main.js: Nombre de jugador establecido:', ESTADO_APP.nombreJugador);
        // Aquí podrías iniciar el juego o permitir que el usuario seleccione la dificultad
        // Por ahora, el juego ya se inicializó con dificultad por defecto, solo ocultamos el modal.
    } else {
        ui.getErrorNombre().textContent = 'El nombre debe tener al menos 3 letras.';
        console.log('main.js: Error: Nombre de jugador inválido.');
    }
}

// Manejador para enviar el formulario de contacto
function handleEnviarContacto(event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario
    console.log('main.js: handleEnviarContacto() - Enviando formulario de contacto.');

    var nombre = document.getElementById('nombreContacto').value;
    var email = document.getElementById('emailContacto').value;
    var mensaje = document.getElementById('mensajeContacto').value;

    var nombreValido = utils.validateName(nombre);
    var emailValido = utils.validateEmail(email);
    var mensajeValido = utils.validateMessage(mensaje);

    document.getElementById('errorNombreContacto').textContent = '';
    document.getElementById('errorEmailContacto').textContent = '';
    document.getElementById('errorMensajeContacto').textContent = '';

    if (!nombreValido) {
        document.getElementById('errorNombreContacto').textContent = 'El nombre debe ser alfanumérico y tener al menos 3 letras.';
    }
    if (!emailValido) {
        document.getElementById('errorEmailContacto').textContent = 'Por favor, introduce un email válido.';
    }
    if (!mensajeValido) {
        document.getElementById('errorMensajeContacto').textContent = 'El mensaje debe tener más de 5 caracteres.';
    }

    if (nombreValido && emailValido && mensajeValido) {
        // Abrir el cliente de correo predeterminado
        var subject = encodeURIComponent('Mensaje desde Buscaminas');
        var body = encodeURIComponent('Nombre: ' + nombre + '\nEmail: ' + email + '\nMensaje: ' + mensaje);
        window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
        // Opcional: limpiar el formulario después de enviar
        formularioContacto.reset();
        console.log('main.js: Formulario de contacto válido. Abriendo cliente de email.');
    } else {
        console.log('main.js: Formulario de contacto inválido.');
    }
}

// Asegurarse de que init se ejecute cuando el DOM esté completamente cargado
window.onload = init;
