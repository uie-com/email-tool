"use client";

import { compressText, decompressText } from "../parse/parse";
import { EditorState, Email, Saves } from "../schema";
import { Values } from "../schema/valueCollection";


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
