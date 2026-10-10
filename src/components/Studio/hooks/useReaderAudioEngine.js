/**
 * @file useReaderAudioEngine.js
 * @description Reader audio engine: owns the toolbar mode and composes the
 * audio channels (narration and music) into the single value shared
 * through ReaderAudioContext.
 * See docs/2026-10-10/READER_MUSIC_PLAN.md
 */

import { useCallback, useMemo, useState } from "react";
import useReaderNarration from "./useReaderNarration";
import useReaderMusic from "./useReaderMusic";

export const AUDIO_MODES = { NARRATION: "narration", MUSIC: "music" };

/**
 * @param {Object} params - Same params as useReaderNarration
 */
const useReaderAudioEngine = (params) => {
  const narration = useReaderNarration(params);
  const music = useReaderMusic({ enabled: params.enabled });

  // The mode only chooses which channel the toolbar controls — switching it
  // never stops a channel, so narration and music can play together.
  const [mode, setModeState] = useState(AUDIO_MODES.NARRATION);

  const setMode = useCallback((nextMode) => {
    if (Object.values(AUDIO_MODES).includes(nextMode)) setModeState(nextMode);
  }, []);

  return useMemo(
    () => ({ mode, setMode, narration, music }),
    [mode, setMode, narration, music]
  );
};

export default useReaderAudioEngine;
