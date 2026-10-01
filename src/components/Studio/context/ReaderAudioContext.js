/**
 * @file ReaderAudioContext.js
 * @description Shares the single reader audio engine (useReaderNarration)
 * with every ReaderAudioControls instance — the toolbar is rendered twice
 * (editor + sticky), so the engine must live above both.
 */

import { createContext, useContext } from "react";

const ReaderAudioContext = createContext(null);

export const useReaderAudio = () => useContext(ReaderAudioContext);

export default ReaderAudioContext;
