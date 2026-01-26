
import path from 'path';
import fs from 'fs';
import os from 'os';
import { resolveAlias, addFavorite, removeFavorite, getFavorites } from '../api';
import Conf from 'conf';

// Mock Conf to use a temporary file
jest.mock('conf', () => {
    return jest.fn().mockImplementation(() => {
        let data: any = { favorites: {}, lastStationsUpdate: 0 };
        return {
            get: (key: string) => data[key],
            set: (key: string, value: any) => { data[key] = value; },
        };
    });
});

describe('API & Favorites Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset favorites through the mock if needed, 
        // but the closure in our mock handles it per-instance if we recreate or clear.
    });

    test('addFavorite and getFavorites', () => {
        addFavorite('MNR-149', 'nh');
        const favs = getFavorites();
        expect(favs['MNR-149']).toBe('nh');
    });

    test('resolveAlias', () => {
        addFavorite('MNR-1', 'gc');
        expect(resolveAlias('gc')).toBe('MNR-1');
        expect(resolveAlias('MNR-1')).toBe('MNR-1');
        expect(resolveAlias('unknown')).toBe('unknown');
    });

    test('removeFavorite', () => {
        addFavorite('LIRR-1', 'penn');
        removeFavorite('penn');
        expect(getFavorites()['LIRR-1']).toBeUndefined();

        addFavorite('MNR-1', 'gc');
        removeFavorite('MNR-1');
        expect(getFavorites()['MNR-1']).toBeUndefined();
    });
});
