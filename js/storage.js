/* js/storage.js */
'use strict';

var STORAGE_KEY = 'buscaminasRanking';
var STORAGE_THEME_KEY = 'buscaminasTema';

// Guarda el resultado de una partida en localStorage
function saveGameResult(playerName, score, duration, date) {
    var resultados = loadGameResults();
    var nuevoResultado = {
        nombre: playerName,
        puntaje: score,
        duracion: duration,
        fecha: date
    };
    resultados.push(nuevoResultado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resultados));
}

// Carga todos los resultados de partidas desde localStorage
function loadGameResults() {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Borra todos los resultados de partidas de localStorage
function clearGameResults() {
    localStorage.removeItem(STORAGE_KEY);
}

// Guarda la preferencia de tema (oscuro/claro)
function guardarTema(tema) {
    localStorage.setItem(STORAGE_THEME_KEY, tema);
}

// Carga la preferencia de tema
function cargarTema() {
    return localStorage.getItem(STORAGE_THEME_KEY);
}

// Exponer funciones públicas
var storage = {
    saveGameResult: saveGameResult,
    loadGameResults: loadGameResults,
    clearGameResults: clearGameResults,
    guardarTema: guardarTema,
    cargarTema: cargarTema
};
