"use client";

import { compressText, decompressText } from "../values/compression";

const DEBUG = false;
export function saveStringToLocalStorage(key: string, value: string) {
    if (typeof window === 'undefined' || !localStorage) return;
    if (DEBUG) console.log('[LOCAL] Saving to local storage', key, value);
    localStorage.setItem(key, compressText(value));
}

export function loadStringFromLocalStorage(key: string) {
    if (typeof window === 'undefined' || !localStorage) return '';
    const value = localStorage.getItem(key);
    if (DEBUG) console.log('[LOCAL] Loading from local storage', key, decompressText(value ?? ''));
    if (!value) return '';
    try {
        return decompressText(value);
    } catch (e) {
        console.error('Error loading string from local storage', e);
        return '';
    }
}

export function hasStringInLocalStorage(key: string) {
    if (typeof window === 'undefined' || !localStorage) return false;
    const value = localStorage.getItem(key);
    if (DEBUG) console.log('[SESSION] Checking local storage', key, value);
    return value !== null;
}


export function saveStringToSessionStorage(key: string, value: string) {
    if (typeof window === 'undefined' || !sessionStorage) return;
    if (DEBUG) console.log('[SESSION] Saving to local storage', key, value);
    sessionStorage.setItem(key, compressText(value));
}

export function loadStringFromSessionStorage(key: string) {
    if (typeof window === 'undefined' || !sessionStorage) return '';
    const value = sessionStorage.getItem(key);
    if (DEBUG) console.log('[SESSION] Loading from local storage', key, decompressText(value ?? ''));
    if (!value) return '';
    try {
        return decompressText(value);
    } catch (e) {
        console.error('Error loading string from local storage', e);
        return '';
    }
}

export function hasStringInSessionStorage(key: string) {
    if (typeof window === 'undefined' || !sessionStorage) return false;
    const value = sessionStorage.getItem(key);
    if (DEBUG) console.log('[SESSION] Checking local storage', key, value);
    return value !== null;
}
