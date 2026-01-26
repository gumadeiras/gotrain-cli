
import axios from 'axios';
import Conf from 'conf';
import path from 'path';
import fs from 'fs';
import os from 'os';

const API_BASE = 'https://metroflow.ainslie.digital/api/v1';
const CACHE_TTL = 60 * 1000; // 60 seconds in ms
const STATIONS_CACHE_TTL = 7 * 24 * 3600 * 1000; // 7 days in ms

const config = new Conf<{
  favorites: Record<string, string>;
  lastStationsUpdate: number;
}>({
  projectName: 'gotrain',
  defaults: {
    favorites: {},
    lastStationsUpdate: 0,
  }
});

const cacheDir = path.join(os.homedir(), '.cache', 'gotrain');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

export interface Station {
  id: string;
  name: string;
  system: string;
  borough?: string;
  accessibilityStatus?: string;
  lines: string[];
}

export interface Departure {
  routeShortName?: string;
  routeLongName?: string;
  destination: string;
  departureTime: string;
  status: string;
  track?: string;
  peakStatus?: string;
  direction?: string;
  tripId?: string;
}

export interface Alert {
  title: string;
  description?: string;
  activePeriods: { start?: string; end?: string }[];
  affectedLines: string[];
  affectedStations: string[];
  affectedStationsLabels: string[];
}

export async function fetchWithCache<T>(endpoint: string, ttl: number = CACHE_TTL): Promise<T> {
  const cacheKey = endpoint.replace(/\//g, '-');
  const cacheFile = path.join(cacheDir, `${cacheKey}.json`);
  const now = Date.now();

  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    if (now - stats.mtimeMs < ttl) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
  }

  const response = await axios.get(`${API_BASE}${endpoint}`);
  fs.writeFileSync(cacheFile, JSON.stringify(response.data));
  return response.data;
}

export async function getStations(): Promise<Station[]> {
  const now = Date.now();
  const lastUpdate = config.get('lastStationsUpdate');
  const stationsFile = path.join(cacheDir, 'stations.json');

  if (fs.existsSync(stationsFile) && (now - lastUpdate < STATIONS_CACHE_TTL)) {
    return JSON.parse(fs.readFileSync(stationsFile, 'utf-8'));
  }

  const response = await axios.get(`${API_BASE}/stations`);
  fs.writeFileSync(stationsFile, JSON.stringify(response.data));
  config.set('lastStationsUpdate', now);
  return response.data;
}

export async function getDepartures(stationId: string): Promise<Departure[]> {
  return fetchWithCache<Departure[]>(`/departures/${stationId}`);
}

export async function getAlerts(): Promise<Alert[]> {
  return fetchWithCache<Alert[]>('/alerts?activeNow=true&includeLabels=true');
}

export function getFavorites(): Record<string, string> {
  return config.get('favorites');
}

export function addFavorite(id: string, alias?: string) {
  const favorites = config.get('favorites');
  favorites[id] = alias || '';
  config.set('favorites', favorites);
}

export function removeFavorite(idOrAlias: string) {
  const favorites = config.get('favorites');
  // Check if it's an ID
  if (favorites[idOrAlias] !== undefined) {
    delete favorites[idOrAlias];
  } else {
    // Check if it's an alias
    const id = Object.keys(favorites).find(key => favorites[key] === idOrAlias);
    if (id) {
      delete favorites[id];
    }
  }
  config.set('favorites', favorites);
}

export function resolveAlias(input: string): string {
  const favorites = config.get('favorites');
  // If it's an alias, return the ID
  const id = Object.keys(favorites).find(key => favorites[key] === input);
  if (id) return id;
  return input;
}
