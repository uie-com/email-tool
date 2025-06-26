"use client";

import { Dispatch, SetStateAction, createContext } from "react";
import { EditorState, GlobalSettings, ShowMessage } from "./schema";

export const GlobalSettingsContext = createContext<[GlobalSettings, Dispatch<SetStateAction<GlobalSettings>>]>([{}, () => { }]);

export const MessageContext = createContext<ShowMessage>(() => { });

export const EditorContext = createContext<[EditorState, Dispatch<SetStateAction<EditorState>>, boolean, (state: EditorState) => void]>([{ step: 0 }, () => { }, true, () => { }]);
