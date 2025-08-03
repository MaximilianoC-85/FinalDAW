/* js/storage.js */
'use strict';

var STORAGE_KEY = 'minesweeperRanking';
var STORAGE_THEME_KEY = 'minesweeperTheme';

// Saves the result of a game in localStorage
function saveGameResult(playerName, score, duration, date) {
    var results = loadGameResults();
    var newResult = {
        name: playerName,
        score: score,
        duration: duration,
        date: date
    };
    results.push(newResult);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

// Loads all game results from localStorage
function loadGameResults() {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Clears all game results from localStorage
function clearGameResults() {
    localStorage.removeItem(STORAGE_KEY);
}

// Saves the theme preference (dark/light)
function saveTheme(theme) {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
}

// Loads the theme preference
function loadTheme() {
    return localStorage.getItem(STORAGE_THEME_KEY);
}

// Expose public functions
var storage = {
    saveGameResult: saveGameResult,
    loadGameResults: loadGameResults,
    clearGameResults: clearGameResults,
    saveTheme: saveTheme,
    loadTheme: loadTheme
};
