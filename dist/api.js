"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithCache = fetchWithCache;
exports.getStations = getStations;
exports.getDepartures = getDepartures;
exports.getAlerts = getAlerts;
exports.getFavorites = getFavorites;
exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.resolveAlias = resolveAlias;
const conf_1 = __importDefault(require("conf"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const API_BASE = 'https://metroflow.ainslie.digital/api/v1';
const CACHE_TTL = 60 * 1000; // 60 seconds in ms
const STATIONS_CACHE_TTL = 7 * 24 * 3600 * 1000; // 7 days in ms
const config = new conf_1.default({
    projectName: 'gotrain',
    defaults: {
        favorites: {},
        lastStationsUpdate: 0,
    }
});
const cacheDir = path_1.default.join(os_1.default.homedir(), '.cache', 'gotrain');
if (!fs_1.default.existsSync(cacheDir)) {
    fs_1.default.mkdirSync(cacheDir, { recursive: true });
}
async function fetchWithCache(endpoint, ttl = CACHE_TTL) {
    const cacheKey = endpoint.replace(/\//g, '-');
    const cacheFile = path_1.default.join(cacheDir, `${cacheKey}.json`);
    const now = Date.now();
    if (fs_1.default.existsSync(cacheFile)) {
        const stats = fs_1.default.statSync(cacheFile);
        if (now - stats.mtimeMs < ttl) {
            return JSON.parse(fs_1.default.readFileSync(cacheFile, 'utf-8'));
        }
    }
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    fs_1.default.writeFileSync(cacheFile, JSON.stringify(data));
    return data;
}
async function getStations() {
    const now = Date.now();
    const lastUpdate = config.get('lastStationsUpdate');
    const stationsFile = path_1.default.join(cacheDir, 'stations.json');
    if (fs_1.default.existsSync(stationsFile) && (now - lastUpdate < STATIONS_CACHE_TTL)) {
        return JSON.parse(fs_1.default.readFileSync(stationsFile, 'utf-8'));
    }
    const response = await fetch(`${API_BASE}/stations`);
    const data = await response.json();
    fs_1.default.writeFileSync(stationsFile, JSON.stringify(data));
    config.set('lastStationsUpdate', now);
    return data;
}
async function getDepartures(stationId) {
    return fetchWithCache(`/departures/${stationId}`);
}
async function getAlerts() {
    return fetchWithCache('/alerts?activeNow=true&includeLabels=true');
}
function getFavorites() {
    return config.get('favorites');
}
function addFavorite(id, alias) {
    const favorites = config.get('favorites');
    favorites[id] = alias || '';
    config.set('favorites', favorites);
}
function removeFavorite(idOrAlias) {
    const favorites = config.get('favorites');
    // Check if it's an ID
    if (favorites[idOrAlias] !== undefined) {
        delete favorites[idOrAlias];
    }
    else {
        // Check if it's an alias
        const id = Object.keys(favorites).find(key => favorites[key] === idOrAlias);
        if (id) {
            delete favorites[id];
        }
    }
    config.set('favorites', favorites);
}
function resolveAlias(input) {
    const favorites = config.get('favorites');
    // If it's an alias, return the ID
    const id = Object.keys(favorites).find(key => favorites[key] === input);
    if (id)
        return id;
    return input;
}
//# sourceMappingURL=api.js.map