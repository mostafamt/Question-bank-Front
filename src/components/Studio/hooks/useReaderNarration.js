/**
 * @file useReaderNarration.js
 * @description Reader narration engine: plays the recorded narration of the
 * active page block by block and highlights the block being read.
 * See docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { buildPageQueue } from "../services/narration.service";

export const AUDIO_MODES = { NARRATION: "narration", MUSIC: "music" };
export const NARRATION_STATUS = {
  IDLE: "idle",
  PLAYING: "playing",
  PAUSED: "paused",
};

const DEFAULT_LANGUAGE = "en";
const DEFAULT_VOLUME = 80;
const MAX_CONSECUTIVE_FAILURES = 3;
// "Previous" restarts the current block once it has played this long.
const RESTART_THRESHOLD_SECONDS = 2;

/**
 * @param {Object} params
 * @param {Object[]} params.pages - Raw pages (with blocks) of the chapter
 * @param {number} params.activePageIndex
 * @param {string|null} params.highlightedBlockId
 * @param {Function} params.hightBlock - (blockId|null) => void
 * @param {string} [params.contentLanguage] - Reading language
 * @param {boolean} params.enabled - Reader mode only
 */
const useReaderNarration = ({
  pages,
  activePageIndex,
  highlightedBlockId,
  hightBlock,
  contentLanguage,
  enabled,
}) => {
  const lang = contentLanguage || DEFAULT_LANGUAGE;

  const [mode, setModeState] = useState(AUDIO_MODES.NARRATION);
  const [status, setStatus] = useState(NARRATION_STATUS.IDLE);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);

  const queue = useMemo(
    () => (enabled ? buildPageQueue(pages?.[activePageIndex], lang) : []),
    [enabled, pages, activePageIndex, lang]
  );

  // One audio element for the whole session: only its `src` changes between
  // blocks, so playback started by the reader's click keeps being allowed.
  const audioRef = useRef(null);
  // Playback position and callbacks live in refs so the audio event handlers
  // (attached once) never act on stale values.
  const queueRef = useRef(queue);
  const indexRef = useRef(-1);
  const failuresRef = useRef(0);
  const preloadRef = useRef(null);
  const hightBlockRef = useRef(hightBlock);

  useEffect(() => {
    hightBlockRef.current = hightBlock;
  }, [hightBlock]);

  const stop = useCallback(() => {
    const wasActive = indexRef.current !== -1;
    indexRef.current = -1;
    failuresRef.current = 0;
    audioRef.current?.pause();
    setStatus(NARRATION_STATUS.IDLE);
    setCurrentBlockId(null);
    // Only clear a highlight narration itself set — never one coming from
    // a TOC / glossary click.
    if (wasActive) hightBlockRef.current?.(null);
  }, []);

  const playAt = useCallback(
    (index) => {
      const audio = audioRef.current;
      const item = queueRef.current[index];
      if (!audio || !item) {
        stop();
        return;
      }

      indexRef.current = index;
      audio.src = item.url;
      audio.play().catch((error) => {
        // AbortError just means another block/pause superseded this call.
        if (error?.name === "NotAllowedError") stop();
      });
      setStatus(NARRATION_STATUS.PLAYING);
      setCurrentBlockId(item.blockId);
      hightBlockRef.current?.(item.blockId);

      // Warm up the next clip to avoid a gap between blocks.
      const next = queueRef.current[index + 1];
      if (next) {
        preloadRef.current = new Audio();
        preloadRef.current.preload = "auto";
        preloadRef.current.src = next.url;
      }
    },
    [stop]
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const audio = new Audio();
    audioRef.current = audio;

    const onEnded = () => {
      if (indexRef.current === -1) return;
      failuresRef.current = 0;
      playAt(indexRef.current + 1);
    };

    const onError = () => {
      if (indexRef.current === -1) return;
      failuresRef.current += 1;
      if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
        stop();
        toast.error("Narration audio could not be loaded.");
        return;
      }
      playAt(indexRef.current + 1);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      indexRef.current = -1;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      preloadRef.current = null;
    };
  }, [enabled, playAt, stop]);

  // Narration belongs to one page: leaving it (or getting a new queue for
  // another language) stops playback.
  useEffect(() => {
    queueRef.current = queue;
    stop();
  }, [queue, stop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    audio.muted = isMuted;
  }, [volume, isMuted, enabled]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (indexRef.current !== -1 && audio.paused) {
      audio.play().catch(() => stop());
      setStatus(NARRATION_STATUS.PLAYING);
      return;
    }

    const fromHighlighted = queueRef.current.findIndex(
      (item) => item.blockId === highlightedBlockId
    );
    failuresRef.current = 0;
    playAt(Math.max(fromHighlighted, 0));
  }, [highlightedBlockId, playAt, stop]);

  const pause = useCallback(() => {
    if (indexRef.current === -1) return;
    audioRef.current?.pause();
    setStatus(NARRATION_STATUS.PAUSED);
  }, []);

  const next = useCallback(() => {
    if (indexRef.current === -1) return;
    failuresRef.current = 0;
    playAt(indexRef.current + 1);
  }, [playAt]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || indexRef.current === -1) return;
    failuresRef.current = 0;
    const shouldRestart =
      audio.currentTime > RESTART_THRESHOLD_SECONDS || indexRef.current === 0;
    playAt(shouldRestart ? indexRef.current : indexRef.current - 1);
  }, [playAt]);

  const setMode = useCallback(
    (nextMode) => {
      stop();
      setModeState(nextMode);
    },
    [stop]
  );

  const changeVolume = useCallback((value) => {
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((muted) => !muted), []);

  return useMemo(
    () => ({
      mode,
      setMode,
      status,
      currentBlockId,
      volume,
      isMuted,
      hasNarration: queue.length > 0,
      play,
      pause,
      stop,
      next,
      previous,
      setVolume: changeVolume,
      toggleMute,
    }),
    [
      mode,
      setMode,
      status,
      currentBlockId,
      volume,
      isMuted,
      queue.length,
      play,
      pause,
      stop,
      next,
      previous,
      changeVolume,
      toggleMute,
    ]
  );
};

export default useReaderNarration;
