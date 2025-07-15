/* js/game.js */
'use strict';

// Variables globales del juego (ahora parte del objeto GAME_STATE)
var GAME_STATE = {
    tablero: [],
    filas: 0,
    columnas: 0,
    minas: 0,
    celdasReveladas: 0,
    juegoTerminado: false,
    primerClick: true,
    intervaloTemporizador: null,
    tiempoTranscurrido: 0,
    puntos: 0, // Añadimos la propiedad de puntos
    dificultadActual: 'facil' // Dificultad por defecto
};

var CONFIGURACIONES_DIFICULTAD = {
    facil: { filas: 8, columnas: 8, minas: 10 },
    medio: { filas: 12, columnas: 12, minas: 25 },
    dificil: { filas: 16, columnas: 16, minas: 40 }
};

// Objeto 'game' que contendrá todas las funciones y variables expuestas
var game = {
    // Función para inicializar el juego
    initializeGame: function(dificultad) {
        console.log('game.js: initializeGame() - Inicializando juego con dificultad:', dificultad);
        var config = CONFIGURACIONES_DIFICULTAD[dificultad];
        if (!config) {
            console.error('game.js: initializeGame() - Dificultad no válida: ' + dificultad + '. Usando dificultad por defecto (facil).');
            config = CONFIGURACIONES_DIFICULTAD.facil; // Usar fácil como fallback
            dificultad = 'facil';
        }

        GAME_STATE.filas = config.filas;
        GAME_STATE.columnas = config.columnas;
        GAME_STATE.minas = config.minas;
        GAME_STATE.dificultadActual = dificultad;

        GAME_STATE.tablero = crearTableroVacio(GAME_STATE.filas, GAME_STATE.columnas);
        GAME_STATE.celdasReveladas = 0;
        GAME_STATE.juegoTerminado = false;
        GAME_STATE.primerClick = true;
        GAME_STATE.tiempoTranscurrido = 0;
        GAME_STATE.puntos = 0; // Reiniciar puntos al inicio del juego
        game.stopTimer(); // Asegurarse de que no haya temporizadores activos
        ui.updateTimerDisplay(0);
        ui.updateMineCounterDisplay(GAME_STATE.minas);

        ui.renderBoard(GAME_STATE.filas, GAME_STATE.columnas);
        game.configurarEventosTablero();
        console.log('game.js: initializeGame() - Juego inicializado.');
    },

    // Función para obtener la dificultad actual
    obtenerDificultadActual: function() {
        return GAME_STATE.dificultadActual;
    },

    // Configura los eventos de click en el tablero
    configurarEventosTablero: function() {
        var tableroDOM = ui.getTableroJuego(); // Usar getter de ui.js
        if (!tableroDOM) {
            console.error('game.js: configurarEventosTablero() - Tablero DOM no encontrado.');
            return;
        }
        // Limpiar eventos previos para evitar duplicados al reiniciar
        var celdas = tableroDOM.getElementsByClassName('celda');
        var i;
        for (i = 0; i < celdas.length; i++) {
            // Clonar el nodo para remover todos los event listeners de forma eficiente
            var oldCelda = celdas[i];
            var newCelda = oldCelda.cloneNode(true);
            oldCelda.parentNode.replaceChild(newCelda, oldCelda);
        }

        // Re-obtener las celdas después de clonar/reemplazar
        celdas = tableroDOM.getElementsByClassName('celda');
        // Añadir nuevos eventos
        for (i = 0; i < celdas.length; i++) {
            celdas[i].addEventListener('click', game.handleClickIzquierdoCelda);
            celdas[i].addEventListener('contextmenu', game.handleRightClickCelda);
        }
        console.log('game.js: configurarEventosTablero() - Eventos del tablero configurados.');
    },

    // Manejador de click izquierdo en una celda
    handleClickIzquierdoCelda: function(event) {
        if (GAME_STATE.juegoTerminado) {
            return;
        }

        var celdaElement = event.target;
        var fila = parseInt(celdaElement.getAttribute('data-fila'), 10);
        var columna = parseInt(celdaElement.getAttribute('data-columna'), 10);
        var celda = GAME_STATE.tablero[fila][columna];

        if (celda.revelada || celda.bandera) {
            // Implementar chording si la celda ya está revelada y tiene el número correcto de banderas
            if (celda.revelada && celda.minasAdyacentes > 0) {
                var banderasAlrededor = contarBanderasAlrededor(fila, columna);
                if (banderasAlrededor === celda.minasAdyacentes) {
                    game.revelarCeldasAdyacentes(fila, columna);
                }
            }
            return;
        }

        if (GAME_STATE.primerClick) {
            // Asegurarse de que el primer click no sea una mina
            colocarMinas(fila, columna);
            calcularMinasAdyacentes();
            game.startTimer();
            GAME_STATE.primerClick = false;
        }

        game.revealCell(fila, columna);
    },

    // Manejador de click derecho en una celda
    handleRightClickCelda: function(event) {
        event.preventDefault(); // Prevenir el menú contextual del navegador
        if (GAME_STATE.juegoTerminado) {
            return;
        }

        var celdaElement = event.target;
        var fila = parseInt(celdaElement.getAttribute('data-fila'), 10);
        var columna = parseInt(celdaElement.getAttribute('data-columna'), 10);

        game.placeFlag(fila, columna);
    },

    // Revela una celda
    revealCell: function(fila, columna) {
        if (!isValidMove(fila, columna) || GAME_STATE.tablero[fila][columna].revelada || GAME_STATE.tablero[fila][columna].bandera) {
            return;
        }

        var celda = GAME_STATE.tablero[fila][columna];
        celda.revelada = true;
        GAME_STATE.celdasReveladas++;

        // Sumar puntos por cada celda no mina revelada
        if (!celda.esMina) {
            GAME_STATE.puntos++;
            console.log('game.js: Puntos actuales:', GAME_STATE.puntos);
        }

        ui.updateCellDisplay(fila, columna, celda);

        if (celda.esMina) {
            game.handleGameOver(false); // Perdiste
            return;
        }

        if (celda.minasAdyacentes === 0) {
            // Expansión recursiva si la celda está vacía
            expandirCeldasVacias(fila, columna);
        }

        game.checkWinCondition();
    },

    // Coloca o quita una bandera
    placeFlag: function(fila, columna) {
        if (!isValidMove(fila, columna) || GAME_STATE.tablero[fila][columna].revelada) {
            return;
        }

        var celda = GAME_STATE.tablero[fila][columna];
        celda.bandera = !celda.bandera;
        ui.updateCellDisplay(fila, columna, celda);
        game.updateMineCounter();
    },

    // Actualiza el contador de minas restantes
    updateMineCounter: function() {
        var banderasPlantadas = 0;
        var i, j;
        for (i = 0; i < GAME_STATE.filas; i++) {
            for (j = 0; j < GAME_STATE.columnas; j++) {
                if (GAME_STATE.tablero[i][j].bandera) {
                    banderasPlantadas++;
                }
            }
        }
        ui.updateMineCounterDisplay(GAME_STATE.minas - banderasPlantadas);
    },

    // Inicia el temporizador del juego
    startTimer: function() {
        if (GAME_STATE.intervaloTemporizador) {
            clearInterval(GAME_STATE.intervaloTemporizador);
        }
        GAME_STATE.tiempoTranscurrido = 0;
        GAME_STATE.intervaloTemporizador = setInterval(function() {
            GAME_STATE.tiempoTranscurrido++;
            ui.updateTimerDisplay(GAME_STATE.tiempoTranscurrido);
        }, 1000);
        console.log('game.js: startTimer() - Temporizador iniciado.');
    },

    // Detiene el temporizador del juego
    stopTimer: function() {
        if (GAME_STATE.intervaloTemporizador) {
            clearInterval(GAME_STATE.intervaloTemporizador);
            GAME_STATE.intervaloTemporizador = null;
        }
        console.log('game.js: stopTimer() - Temporizador detenido.');
    },

    // Verifica la condición de victoria
    checkWinCondition: function() {
        var celdasNoMinas = (GAME_STATE.filas * GAME_STATE.columnas) - GAME_STATE.minas;
        if (GAME_STATE.celdasReveladas === celdasNoMinas) {
            game.handleGameOver(true); // Ganaste
            console.log('game.js: checkWinCondition() - ¡Juego ganado!');
        }
    },

    // Maneja el fin del juego (victoria o derrota)
    handleGameOver: function(esVictoria) {
        GAME_STATE.juegoTerminado = true;
        game.stopTimer();
        console.log('game.js: handleGameOver() - Juego terminado. Victoria:', esVictoria);

        // Revelar todas las minas al perder
        if (!esVictoria) {
            var i, j;
            for (i = 0; i < GAME_STATE.filas; i++) {
                for (j = 0; j < GAME_STATE.columnas; j++) {
                    var celda = GAME_STATE.tablero[i][j];
                    if (celda.esMina && !celda.bandera) { // Solo revelar minas no marcadas con bandera
                        ui.updateCellDisplay(i, j, celda, true); // Pasar true para forzar revelación de mina
                    }
                }
            }
        }

        var mensaje = esVictoria ? '¡Felicidades, has ganado!' : '¡Boom! Has perdido.';
        ui.showMessage(esVictoria ? 'victoria' : 'derrota', mensaje);

        // Guardar resultado si es una victoria o derrota
        // Asegurarse de que window.ESTADO_APP y window.ESTADO_APP.nombreJugador existan
        if (typeof window.ESTADO_APP !== 'undefined' && window.ESTADO_APP.nombreJugador) {
            storage.saveGameResult(
                window.ESTADO_APP.nombreJugador,
                GAME_STATE.puntos, // Ahora se guardan los puntos acumulados como puntaje
                GAME_STATE.tiempoTranscurrido,
                new Date().toISOString()
            );
            console.log('game.js: handleGameOver() - Resultado guardado. Puntos:', GAME_STATE.puntos);
        } else {
            console.warn('game.js: handleGameOver() - No se pudo guardar el resultado. Nombre de jugador no definido.');
        }
    },

    // Expande celdas adyacentes (usado para chording)
    revelarCeldasAdyacentes: function(fila, columna) {
        var i, j;
        for (i = -1; i <= 1; i++) {
            for (j = -1; j <= 1; j++) {
                var nuevaFila = fila + i;
                var nuevaColumna = columna + j;

                if (isValidMove(nuevaFila, nuevaColumna) &&
                    !GAME_STATE.tablero[nuevaFila][nuevaColumna].revelada &&
                    !GAME_STATE.tablero[nuevaFila][nuevaColumna].bandera) {
                    game.revealCell(nuevaFila, nuevaColumna); // Llamar a revealCell a través del objeto game
                }
            }
        }
        console.log('game.js: revelarCeldasAdyacentes() - Celdas adyacentes reveladas.');
    }
};

// Funciones auxiliares (no necesitan ser parte del objeto 'game' si solo se usan internamente)
function crearTableroVacio(filas, columnas) {
    var tablero = [];
    var i, j;
    for (i = 0; i < filas; i++) {
        tablero[i] = [];
        for (j = 0; j < columnas; j++) {
            tablero[i][j] = {
                esMina: false,
                revelada: false,
                bandera: false,
                minasAdyacentes: 0
            };
        }
    }
    console.log('game.js: crearTableroVacio() - Tablero vacío creado.');
    return tablero;
}

// Coloca las minas en el tablero, asegurándose de que la primera celda clickeada no sea una mina
function colocarMinas(filaInicial, columnaInicial) {
    var minasColocadas = 0;
    while (minasColocadas < GAME_STATE.minas) {
        var fila = utils.getRandomNumber(0, GAME_STATE.filas - 1);
        var columna = utils.getRandomNumber(0, GAME_STATE.columnas - 1);

        // Asegurarse de que no sea la celda inicial ni una mina ya existente
        if (!GAME_STATE.tablero[fila][columna].esMina &&
            !(fila === filaInicial && columna === columnaInicial)) {
            GAME_STATE.tablero[fila][columna].esMina = true;
            minasColocadas++;
        }
    }
    console.log('game.js: colocarMinas() - Minas colocadas:', minasColocadas);
}

// Calcula el número de minas adyacentes para cada celda
function calcularMinasAdyacentes() {
    var i, j;
    for (i = 0; i < GAME_STATE.filas; i++) {
        for (j = 0; j < GAME_STATE.columnas; j++) {
            if (!GAME_STATE.tablero[i][j].esMina) {
                GAME_STATE.tablero[i][j].minasAdyacentes = contarMinasAlrededor(i, j);
            }
        }
    }
    console.log('game.js: calcularMinasAdyacentes() - Minas adyacentes calculadas.');
}

// Cuenta las minas alrededor de una celda específica
function contarMinasAlrededor(fila, columna) {
    var contador = 0;
    var i, j;
    for (i = -1; i <= 1; i++) {
        for (j = -1; j <= 1; j++) {
            var nuevaFila = fila + i;
            var nuevaColumna = columna + j;

            if (isValidMove(nuevaFila, nuevaColumna) && GAME_STATE.tablero[nuevaFila][nuevaColumna].esMina) {
                contador++;
            }
        }
    }
    return contador;
}

// Cuenta las banderas alrededor de una celda específica
function contarBanderasAlrededor(fila, columna) {
    var contador = 0;
    var i, j;
    for (i = -1; i <= 1; i++) {
        for (j = -1; j <= 1; j++) {
            var nuevaFila = fila + i;
            var nuevaColumna = columna + j;

            if (isValidMove(nuevaFila, nuevaColumna) && GAME_STATE.tablero[nuevaFila][nuevaColumna].bandera) {
                contador++;
            }
        }
    }
    return contador;
}

// Expande celdas vacías recursivamente
function expandirCeldasVacias(fila, columna) {
    var i, j;
    for (i = -1; i <= 1; i++) {
        for (j = -1; j <= 1; j++) {
            var nuevaFila = fila + i;
            var nuevaColumna = columna + j;

            if (isValidMove(nuevaFila, nuevaColumna) &&
                !GAME_STATE.tablero[nuevaFila][nuevaColumna].revelada &&
                !GAME_STATE.tablero[nuevaFila][nuevaColumna].esMina &&
                !GAME_STATE.tablero[nuevaFila][nuevaColumna].bandera) {
                game.revealCell(nuevaFila, nuevaColumna); // Llamar a revealCell a través del objeto game
            }
        }
    }
    console.log('game.js: expandirCeldasVacias() - Expansión de celdas vacías completada.');
}

// Verifica si la celda está dentro de los límites del tablero
function isValidMove(fila, columna) {
    return fila >= 0 && fila < GAME_STATE.filas &&
           columna >= 0 && columna < GAME_STATE.columnas;
}
