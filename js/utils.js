/* js/utils.js */
'use strict';

// Valida que el nombre tenga al menos 3 caracteres alfanuméricos
function validateName(name) {
    // Expresión regular para alfanumérico (letras, números, espacios)
    // Permite espacios pero no solo espacios.
    return typeof name === 'string' && name.trim().length >= 3 && /^[a-zA-Z0-9\s]+$/.test(name);
}

// Valida el formato de un email
function validateEmail(email) {
    // Expresión regular básica para validar email
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Valida que el mensaje tenga más de 5 caracteres
function validateMessage(message) {
    return typeof message === 'string' && message.trim().length > 5;
}

// Genera un número entero aleatorio entre min (inclusive) y max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ordena el ranking por puntaje (descendente) o fecha (más reciente primero)
function sortRanking(ranking, sortBy) {
    var RankingCopy = ranking.slice();

    if (sortBy === 'score') {
        RankingCopy.sort(function(a, b) {
            return b.score - a.score;
        });
    } else if (sortBy === 'date') {
        RankingCopy.sort(function(a, b) {
            return new Date(b.date).getTime() - new Date(a.date).getTime(); // Orden descendente por fecha
        });
    }
    return RankingCopy;
}

// Exponer funciones públicas
var utils = {
    validateName: validateName,
    validateEmail: validateEmail,
    validateMessage: validateMessage,
    getRandomNumber: getRandomNumber,
    sortRanking: sortRanking
};
