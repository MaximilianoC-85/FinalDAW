/* js/ui.js */
'use strict';

// Variables globales para elementos del DOM específicos de la UI
var UI_ELEMENTS = {
    tableroJuego: null,
    contadorMinas: null,
    temporizador: null,
    modalNombreJugador: null,
    inputNombreJugador: null,
    botonIniciarPartida: null,
    errorNombre: null,
    modalDificultad: null,
    cerrarModalDificultad: null,
    botonesDificultad: null,
    modalFinJuego: null,
    cerrarModalFinJuego: null,
    mensajeFinJuego: null,
    modalRanking: null,
    cerrarModalRanking: null,
    listaRanking: null,
    ordenarPorPuntaje: null,
    ordenarPorFecha: null,
    botonReiniciar: null,
    botonTema: null,
    botonDificultad: null,
    botonRanking: null
};

// Función de inicialización de la UI
function initUiElements() {
    console.log('ui.js: initUiElements() - Obteniendo referencias DOM.');
    // Obtener todas las referencias a los elementos del DOM
    // Se añade una verificación para asegurar que el elemento existe antes de asignarlo
    UI_ELEMENTS.tableroJuego = document.getElementById('tableroJuego');
    UI_ELEMENTS.contadorMinas = document.getElementById('contadorMinas');
    UI_ELEMENTS.temporizador = document.getElementById('temporizador');

    UI_ELEMENTS.modalNombreJugador = document.getElementById('modalNombreJugador');
    UI_ELEMENTS.inputNombreJugador = document.getElementById('inputNombreJugador');
    UI_ELEMENTS.botonIniciarPartida = document.getElementById('botonIniciarPartida');
    UI_ELEMENTS.errorNombre = document.getElementById('errorNombre');

    UI_ELEMENTS.modalDificultad = document.getElementById('modalDificultad');
    UI_ELEMENTS.cerrarModalDificultad = document.getElementById('cerrarModalDificultad');
    UI_ELEMENTS.botonesDificultad = document.getElementsByClassName('boton-opcion-dificultad');

    UI_ELEMENTS.modalFinJuego = document.getElementById('modalFinJuego');
    UI_ELEMENTS.cerrarModalFinJuego = document.getElementById('cerrarModalFinJuego');
    UI_ELEMENTS.mensajeFinJuego = document.getElementById('mensajeFinJuego');

    UI_ELEMENTS.modalRanking = document.getElementById('modalRanking');
    UI_ELEMENTS.cerrarModalRanking = document.getElementById('cerrarModalRanking');
    UI_ELEMENTS.listaRanking = document.getElementById('listaRanking');
    UI_ELEMENTS.ordenarPorPuntaje = document.getElementById('ordenarPorPuntaje');
    UI_ELEMENTS.ordenarPorFecha = document.getElementById('ordenarPorFecha');

    UI_ELEMENTS.botonReiniciar = document.getElementById('botonReiniciar');
    UI_ELEMENTS.botonTema = document.getElementById('botonTema');
    UI_ELEMENTS.botonDificultad = document.getElementById('botonDificultad');
    UI_ELEMENTS.botonRanking = document.getElementById('botonRanking');

    // Aquí se podrían adjuntar event listeners específicos de la UI si no se manejan en main.js
    // Por ejemplo, el click del botón de tema ya se maneja en main.js, pero si ui.js lo necesitara internamente, se haría aquí.
}

// Renderiza el tablero de juego en el DOM
function renderBoard(filas, columnas) {
    var tableroDOM = UI_ELEMENTS.tableroJuego;
    if (!tableroDOM) {
        console.log('ui.js: renderBoard() - tableroJuego no encontrado.');
        return;
    } // Verificar si el elemento existe
    var i, j;

    // Limpiar tablero existente
    tableroDOM.innerHTML = '';
    tableroDOM.style.gridTemplateColumns = 'repeat(' + columnas + ', 1fr)';

    // Crear celdas
    for (i = 0; i < filas; i++) {
        for (j = 0; j < columnas; j++) {
            var celdaElement = document.createElement('div');
            celdaElement.className = 'celda';
            celdaElement.setAttribute('data-fila', i);
            celdaElement.setAttribute('data-columna', j);
            tableroDOM.appendChild(celdaElement);
        }
    }
    console.log('ui.js: renderBoard() - Tablero renderizado.');
}

// Actualiza la apariencia de una celda en el DOM
function updateCellDisplay(fila, columna, celdaData, forzarMina) {
    if (!UI_ELEMENTS.tableroJuego) {
        console.log('ui.js: updateCellDisplay() - tableroJuego no encontrado.');
        return;
    } // Verificar si el tablero existe
    var celdaElement = UI_ELEMENTS.tableroJuego.querySelector('[data-fila="' + fila + '"][data-columna="' + columna + '"]');
    if (!celdaElement) {
        console.log('ui.js: updateCellDisplay() - Celda no encontrada en Fila:', fila, 'Columna:', columna);
        return;
    }

    celdaElement.className = 'celda'; // Resetear clases

    if (celdaData.revelada) {
        celdaElement.classList.add('revelada');
        if (celdaData.esMina) {
            celdaElement.classList.add('mina');
            celdaElement.innerHTML = '💣'; // Emoji de bomba
        } else if (celdaData.minasAdyacentes > 0) {
            celdaElement.classList.add('num-' + celdaData.minasAdyacentes);
            celdaElement.innerHTML = celdaData.minasAdyacentes;
        } else {
            celdaElement.innerHTML = ''; // Celda vacía
        }
    } else if (celdaData.bandera) {
        celdaElement.classList.add('bandera');
        celdaElement.innerHTML = '🚩'; // Emoji de bandera
    } else {
        celdaElement.innerHTML = ''; // Celda sin revelar y sin bandera
    }

    // Para forzar la revelación de una mina al perder, incluso si no estaba "revelada" en el modelo
    if (forzarMina && celdaData.esMina) {
        celdaElement.classList.add('revelada');
        celdaElement.classList.add('mina');
        celdaElement.innerHTML = '💣';
    }
    console.log('ui.js: updateCellDisplay() - Celda Fila:', fila, 'Columna:', columna, 'actualizada.');
}

// Muestra un mensaje al usuario (victoria/derrota) en un modal
function showMessage(type, message) {
    if (!UI_ELEMENTS.modalFinJuego || !UI_ELEMENTS.mensajeFinJuego) {
        console.log('ui.js: showMessage() - Modal de fin de juego no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.mensajeFinJuego.textContent = message;
    UI_ELEMENTS.modalFinJuego.style.display = 'flex';
    console.log('ui.js: showMessage() - Mostrando mensaje:', message);
}

// Oculta el modal de fin de juego
function hideGameOverModal() {
    if (!UI_ELEMENTS.modalFinJuego) {
        console.log('ui.js: hideGameOverModal() - Modal de fin de juego no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalFinJuego.style.display = 'none';
    console.log('ui.js: hideGameOverModal() - Ocultando modal de fin de juego.');
}

// Muestra el modal para ingresar el nombre del jugador
function showNameInputModal() {
    if (!UI_ELEMENTS.modalNombreJugador) {
        console.log('ui.js: showNameInputModal() - Modal de nombre de jugador no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalNombreJugador.style.display = 'flex';
    if (UI_ELEMENTS.inputNombreJugador) {
        UI_ELEMENTS.inputNombreJugador.focus(); // Poner foco en el input
    }
    console.log('ui.js: showNameInputModal() - Mostrando modal de nombre de jugador.');
}

// Oculta el modal de nombre del jugador
function hideNameInputModal() {
    if (!UI_ELEMENTS.modalNombreJugador) {
        console.log('ui.js: hideNameInputModal() - Modal de nombre de jugador no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalNombreJugador.style.display = 'none';
    if (UI_ELEMENTS.errorNombre) {
        UI_ELEMENTS.errorNombre.textContent = ''; // Limpiar mensaje de error
    }
    console.log('ui.js: hideNameInputModal() - Ocultando modal de nombre de jugador.');
}

// Muestra el modal de selección de dificultad
function showDifficultyModal() {
    if (!UI_ELEMENTS.modalDificultad) {
        console.log('ui.js: showDifficultyModal() - Modal de dificultad no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalDificultad.style.display = 'flex';
    console.log('ui.js: showDifficultyModal() - Mostrando modal de dificultad.');
}

// Oculta el modal de selección de dificultad
function hideDifficultyModal() {
    if (!UI_ELEMENTS.modalDificultad) {
        console.log('ui.js: hideDifficultyModal() - Modal de dificultad no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalDificultad.style.display = 'none';
    console.log('ui.js: hideDifficultyModal() - Ocultando modal de dificultad.');
}

// Muestra el modal de ranking
function showRankingModal() {
    if (!UI_ELEMENTS.modalRanking) {
        console.log('ui.js: showRankingModal() - Modal de ranking no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalRanking.style.display = 'flex';
    console.log('ui.js: showRankingModal() - Mostrando modal de ranking.');
}

// Oculta el modal de ranking
function hideRankingModal() {
    if (!UI_ELEMENTS.modalRanking) {
        console.log('ui.js: hideRankingModal() - Modal de ranking no encontrado.');
        return;
    } // Verificar si el modal existe
    UI_ELEMENTS.modalRanking.style.display = 'none';
    console.log('ui.js: hideRankingModal() - Ocultando modal de ranking.');
}

// Renderiza la lista de ranking
function renderRanking(rankingData) {
    var lista = UI_ELEMENTS.listaRanking;
    if (!lista) {
        console.log('ui.js: renderRanking() - Lista de ranking no encontrada.');
        return;
    } // Verificar si la lista existe
    var i;
    lista.innerHTML = ''; // Limpiar lista existente

    if (rankingData.length === 0) {
        var li = document.createElement('li');
        li.textContent = 'No hay partidas registradas aún.';
        lista.appendChild(li);
        console.log('ui.js: renderRanking() - No hay partidas registradas.');
        return;
    }

    for (i = 0; i < rankingData.length; i++) {
        var partida = rankingData[i];
        var li = document.createElement('li');
        var fecha = new Date(partida.fecha).toLocaleString();
        li.textContent = partida.nombre + ' - Puntaje: ' + partida.puntaje + ' - Duración: ' + partida.duracion + 's - Fecha: ' + fecha;
        lista.appendChild(li);
    }
    console.log('ui.js: renderRanking() - Ranking renderizado con', rankingData.length, 'partidas.');
}

// Actualiza el contador de minas en la UI
function updateMineCounterDisplay(count) {
    if (!UI_ELEMENTS.contadorMinas) {
        console.log('ui.js: updateMineCounterDisplay() - Contador de minas no encontrado.');
        return;
    } // Verificar si el elemento existe
    UI_ELEMENTS.contadorMinas.textContent = (count < 0 ? '-' : '') + String(Math.abs(count)).padStart(3, '0');
    console.log('ui.js: updateMineCounterDisplay() - Contador de minas actualizado a:', count);
}

// Actualiza el temporizador en la UI
function updateTimerDisplay(seconds) {
    if (!UI_ELEMENTS.temporizador) {
        console.log('ui.js: updateTimerDisplay() - Temporizador no encontrado.');
        return;
    } // Verificar si el elemento existe
    var minutos = Math.floor(seconds / 60);
    var segundos = seconds % 60;
    UI_ELEMENTS.temporizador.textContent = String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
    console.log('ui.js: updateTimerDisplay() - Temporizador actualizado a:', seconds, 'segundos.');
}

// Alterna entre modo oscuro y claro
function toggleTheme(esModoOscuro) {
    console.log('ui.js: toggleTheme() - Cambiando tema a modo oscuro:', esModoOscuro);
    if (esModoOscuro) {
        document.body.classList.add('modo-oscuro');
        if (UI_ELEMENTS.botonTema) { // Verificar si el botón existe antes de acceder a textContent
            UI_ELEMENTS.botonTema.textContent = 'Modo Claro';
            console.log('ui.js: toggleTheme() - Texto del botón de tema actualizado a "Modo Claro".');
        }
    } else {
        document.body.classList.remove('modo-oscuro');
        if (UI_ELEMENTS.botonTema) { // Verificar si el botón existe antes de acceder a textContent
            UI_ELEMENTS.botonTema.textContent = 'Modo Oscuro';
            console.log('ui.js: toggleTheme() - Texto del botón de tema actualizado a "Modo Oscuro".');
        }
    }
}

// Getters para elementos DOM que main.js necesita referenciar
function getBotonReiniciar() { return UI_ELEMENTS.botonReiniciar; }
function getBotonTema() { return UI_ELEMENTS.botonTema; }
function getBotonDificultad() { return UI_ELEMENTS.botonDificultad; }
function getBotonRanking() { return UI_ELEMENTS.botonRanking; }
function getInputNombreJugador() { return UI_ELEMENTS.inputNombreJugador; }
function getBotonIniciarPartida() { return UI_ELEMENTS.botonIniciarPartida; }
function getErrorNombre() { return UI_ELEMENTS.errorNombre; }
function getCerrarModalDificultad() { return UI_ELEMENTS.cerrarModalDificultad; }
function getBotonesDificultad() { return UI_ELEMENTS.botonesDificultad; }
function getCerrarModalFinJuego() { return UI_ELEMENTS.cerrarModalFinJuego; }
function getCerrarModalRanking() { return UI_ELEMENTS.cerrarModalRanking; }
function getOrdenarPorPuntaje() { return UI_ELEMENTS.ordenarPorPuntaje; }
function getOrdenarPorFecha() { return UI_ELEMENTS.ordenarPorFecha; }
function getModalNombreJugador() { return UI_ELEMENTS.modalNombreJugador; }
function getTableroJuego() { return UI_ELEMENTS.tableroJuego; }


// Exponer funciones públicas
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
    // Exponer getters para que main.js pueda acceder a los elementos DOM
    getBotonReiniciar: getBotonReiniciar,
    getBotonTema: getBotonTema,
    getBotonDificultad: getBotonDificultad,
    getBotonRanking: getBotonRanking,
    getInputNombreJugador: getInputNombreJugador,
    getBotonIniciarPartida: getBotonIniciarPartida,
    getErrorNombre: getErrorNombre,
    getCerrarModalDificultad: getCerrarModalDificultad,
    getBotonesDificultad: getBotonesDificultad,
    getCerrarModalFinJuego: getCerrarModalFinJuego,
    getCerrarModalRanking: getCerrarModalRanking,
    getOrdenarPorPuntaje: getOrdenarPorPuntaje,
    getOrdenarPorFecha: getOrdenarPorFecha,
    getModalNombreJugador: getModalNombreJugador,
    getTableroJuego: getTableroJuego
};
