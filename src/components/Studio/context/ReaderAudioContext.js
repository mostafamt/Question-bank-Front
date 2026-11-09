/**
 * @file ReaderAudioContext.js
 * @description Shares the single reader audio engine (useReaderAudioEngine)
 * with every ReaderAudioControls instance — the toolbar is rendered twice
 * (editor + sticky), so the engine must live above both.
 * Value shape: { mode, setMode, narration, music }.
 */

import { createContext, useContext } from "react";

const ReaderAudioContext = createContext(null);

export const useReaderAudio = () => useContext(ReaderAudioContext);

export default ReaderAudioContext;
