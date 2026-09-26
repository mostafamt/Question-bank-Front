/**
 * @file ReaderAudioControls.jsx
 * @description Reader toolbar control for Narration / Music (UI only).
 * No audio is played yet — see docs/2026-09-26/READER_NARRATION_MUSIC_PLAN.md
 * for the engine that will drive this.
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

import styles from "./readerAudioControls.module.scss";

const MODES = {
  NARRATION: { id: "narration", label: "Narration", Icon: RecordVoiceOverIcon },
  MUSIC: { id: "music", label: "Music", Icon: MusicNoteIcon },
};

const ReaderAudioControls = () => {
  const [mode, setMode] = React.useState(MODES.NARRATION);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(80);
  const [isMuted, setIsMuted] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  const onSelectMode = (nextMode) => {
    setMode(nextMode);
    setIsPlaying(false);
    setMenuAnchor(null);
  };

  const ModeIcon = mode.Icon;

  return (
    <div className={styles["reader-audio"]}>
      <Tooltip title={mode.label}>
        <ModeIcon className={styles["mode-icon"]} aria-label={mode.label} />
      </Tooltip>

      <div className={styles.pill}>
        <Tooltip title={isPlaying ? "Pause" : "Play"}>
          <IconButton
            size="small"
            aria-label={isPlaying ? "pause" : "play"}
            onClick={() => setIsPlaying((p) => !p)}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>

        {isPlaying && (
          <Slider
            size="small"
            aria-label="volume"
            value={isMuted ? 0 : volume}
            onChange={(_, value) => {
              setVolume(value);
              setIsMuted(value === 0);
            }}
            className={styles.slider}
          />
        )}

        <Tooltip title={isMuted ? "Unmute" : "Mute"}>
          <IconButton
            size="small"
            aria-label={isMuted ? "unmute" : "mute"}
            onClick={() => setIsMuted((m) => !m)}
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
