/**
 * @file useReaderMusic.js
 * @description Reader background music engine: one looping audio element
 * playing a built-in track or a file the reader picked from their computer.
 * Independent of the page, so it keeps playing while the reader browses.
 * See docs/2026-10-10/READER_MUSIC_PLAN.md
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { READER_MUSIC_TRACKS } from "../../../config/reader-music";
import { NARRATION_STATUS as MUSIC_STATUS } from "./useReaderNarration";

export const USER_TRACK_ID = "user-file";

const DEFAULT_VOLUME = 30;

const isUserTrack = (track) => track?.id === USER_TRACK_ID;

/**
 * @param {Object} params
 * @param {boolean} params.enabled - Reader mode only
 */
const useReaderMusic = ({ enabled }) => {
  const [status, setStatus] = useState(MUSIC_STATUS.IDLE);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [userTrack, setUserTrack] = useState(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  // Mirrors of the state above, read by the audio event handlers (attached
  // once) and by callbacks that must not go stale.
  const currentTrackRef = useRef(null);
  const userTrackRef = useRef(null);
  // The last track that loaded successfully — restored if a new one fails.
  const committedTrackRef = useRef(null);
  // { track } while a newly chosen track is loading.
  const pendingRef = useRef(null);

  const setCurrent = useCallback((track) => {
    currentTrackRef.current = track;
    setCurrentTrack(track);
  }, []);

  // A user file's object URL is freed once nothing refers to it anymore.
  const revokeIfUnused = (track) => {
    if (
      isUserTrack(track) &&
      track !== userTrackRef.current &&
      track !== committedTrackRef.current &&
      track !== pendingRef.current?.track
    ) {
      URL.revokeObjectURL(track.url);
    }
  };

  const startTrack = useCallback(
    (track) => {
      const audio = audioRef.current;
      if (!audio || !track) return;

      // Another track was still loading: it is abandoned.
      const abandoned = pendingRef.current?.track;
      pendingRef.current = { track };
      if (abandoned && abandoned !== track) revokeIfUnused(abandoned);

      setCurrent(track);
      audio.src = track.url;
      audio.play().catch((error) => {
        // Blocked by the browser: the reader can still press ▶.
        if (error?.name === "NotAllowedError") setStatus(MUSIC_STATUS.PAUSED);
        // AbortError just means another track/pause superseded this call.
      });
      setStatus(MUSIC_STATUS.PLAYING);
    },
    [setCurrent]
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    const onLoaded = () => {
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;

      const previous = committedTrackRef.current;
      committedTrackRef.current = pending.track;

      if (isUserTrack(pending.track)) {
        const previousUserTrack = userTrackRef.current;
        userTrackRef.current = pending.track;
        setUserTrack(pending.track);
        if (previousUserTrack) revokeIfUnused(previousUserTrack);
      }
      if (previous) revokeIfUnused(previous);
    };

    const onError = () => {
      // Errors fired after the src was cleared on unmount are not real.
      if (!audio.getAttribute("src")) return;

      const pending = pendingRef.current;
      pendingRef.current = null;
      const failed = pending?.track ?? currentTrackRef.current;

      toast.error(
        isUserTrack(failed)
          ? "This file can't be played."
          : "Music could not be loaded."
      );

      // A newly chosen track failed: go back to the previous one, paused.
      const previous = pending ? committedTrackRef.current : null;
      if (failed) revokeIfUnused(failed);

      if (previous) {
        setCurrent(previous);
        audio.src = previous.url;
      } else {
        committedTrackRef.current = null;
        setCurrent(null);
        audio.removeAttribute("src");
      }
      setStatus(MUSIC_STATUS.IDLE);
    };

    audio.addEventListener("loadeddata", onLoaded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("loadeddata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;

      [
        userTrackRef.current,
        committedTrackRef.current,
        pendingRef.current?.track,
      ].forEach((track) => {
        if (isUserTrack(track)) URL.revokeObjectURL(track.url);
      });
      userTrackRef.current = null;
      committedTrackRef.current = null;
      pendingRef.current = null;
      currentTrackRef.current = null;
      setUserTrack(null);
      setCurrentTrack(null);
      setStatus(MUSIC_STATUS.IDLE);
    };
  }, [enabled, setCurrent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    audio.muted = isMuted;
  }, [volume, isMuted, enabled]);

  /**
   * Resume the current track, or start the first built-in one.
   * @returns {boolean} false when there is nothing to play (the caller
   * should then let the reader pick a file).
   */
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return false;

    const track = currentTrackRef.current;
    if (track && audio.getAttribute("src")) {
      audio.play().catch((error) => {
        if (error?.name === "NotAllowedError") setStatus(MUSIC_STATUS.PAUSED);
      });
      setStatus(MUSIC_STATUS.PLAYING);
      return true;
    }

    if (!READER_MUSIC_TRACKS.length) return false;
    startTrack(READER_MUSIC_TRACKS[0]);
    return true;
  }, [startTrack]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setStatus(MUSIC_STATUS.PAUSED);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setStatus(MUSIC_STATUS.IDLE);
  }, []);

  /** Play a built-in track, or the reader's file (USER_TRACK_ID). */
  const selectTrack = useCallback(
    (id) => {
      const track =
        id === USER_TRACK_ID
          ? userTrackRef.current
          : READER_MUSIC_TRACKS.find((t) => t.id === id);
      if (!track) return;
      if (track === currentTrackRef.current && audioRef.current?.getAttribute("src")) {
        play();
        return;
      }
      startTrack(track);
    },
    [play, startTrack]
  );

  /** Play a file picked by the reader. It is never uploaded. */
  const loadFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type?.startsWith("audio/")) {
        toast.error("This file can't be played.");
        return;
      }
      startTrack({
        id: USER_TRACK_ID,
        label: file.name,
        url: URL.createObjectURL(file),
      });
    },
    [startTrack]
  );

  const changeVolume = useCallback((value) => {
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((muted) => !muted), []);

  return useMemo(
    () => ({
      status,
      tracks: READER_MUSIC_TRACKS,
      currentTrack,
      userTrack,
      volume,
      isMuted,
      play,
      pause,
      stop,
      selectTrack,
      loadFile,
      setVolume: changeVolume,
      toggleMute,
    }),
    [
      status,
      currentTrack,
      userTrack,
      volume,
      isMuted,
      play,
      pause,
      stop,
      selectTrack,
      loadFile,
      changeVolume,
      toggleMute,
    ]
  );
};

export default useReaderMusic;
