/**
 * @file ReaderAudioControls.jsx
 * @description Reader toolbar control for Narration / Music.
 * Narration is driven by the shared engine (useReaderNarration) through
 * ReaderAudioContext — see docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md.
 * Music is still UI only.
 */

import React from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Slider,
  Tooltip,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";

import { useReaderAudio } from "../Studio/context/ReaderAudioContext";
import {
  AUDIO_MODES,
  NARRATION_STATUS,
} from "../Studio/hooks/useReaderNarration";
import styles from "./readerAudioControls.module.scss";

const MODES = {
  NARRATION: {
    id: AUDIO_MODES.NARRATION,
    label: "Narration",
    Icon: RecordVoiceOverIcon,
  },
  MUSIC: { id: AUDIO_MODES.MUSIC, label: "Music", Icon: MusicNoteIcon },
};

const ReaderAudioControls = () => {
  const audio = useReaderAudio();
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  if (!audio) return null;

  const { volume, isMuted, hasNarration } = audio;
  const mode =
    Object.values(MODES).find((m) => m.id === audio.mode) || MODES.NARRATION;
  const isNarration = mode.id === AUDIO_MODES.NARRATION;
  const isPlaying = isNarration
    ? audio.status === NARRATION_STATUS.PLAYING
    : isMusicPlaying;
  const showSlider = isPlaying || audio.status === NARRATION_STATUS.PAUSED;
  const isPlayDisabled = isNarration && !hasNarration;

  const onSelectMode = (nextMode) => {
    audio.setMode(nextMode.id);
    setIsMusicPlaying(false);
    setMenuAnchor(null);
  };

  const onTogglePlay = () => {
    if (!isNarration) {
      setIsMusicPlaying((p) => !p);
      return;
    }
    if (isPlaying) audio.pause();
    else audio.play();
  };

  const playTitle = isPlayDisabled
    ? "No narration for this page"
    : isPlaying
    ? "Pause"
    : "Play";

  const ModeIcon = mode.Icon;

  return (
    <div className={styles["reader-audio"]}>
      <Tooltip title={mode.label}>
        <ModeIcon className={styles["mode-icon"]} aria-label={mode.label} />
      </Tooltip>

      <div className={styles.pill}>
        <Tooltip title={playTitle}>
          <span>
            <IconButton
              size="small"
              aria-label={isPlaying ? "pause" : "play"}
              onClick={onTogglePlay}
              disabled={isPlayDisabled}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </span>
        </Tooltip>

        {showSlider && (
          <Slider
            size="small"
            aria-label="volume"
            value={isMuted ? 0 : volume}
            onChange={(_, value) => audio.setVolume(value)}
            className={styles.slider}
          />
        )}

        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
          <IconButton
            size="small"
            aria-label={isMuted ? "unmute" : "mute"}
            onClick={audio.toggleMute}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>
      </div>

      <IconButton
        size="small"
        aria-label="audio-options"
        aria-haspopup="true"
        aria-controls={menuAnchor ? "reader-audio-menu" : undefined}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="reader-audio-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {Object.values(MODES).map((m) => (
          <MenuItem
            key={m.id}
            selected={mode.id === m.id}
            onClick={() => onSelectMode(m)}
          >
            <ListItemIcon>
              <m.Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{m.label}</ListItemText>
            {mode.id === m.id && <CheckIcon fontSize="small" sx={{ ml: 2 }} />}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default ReaderAudioControls;
