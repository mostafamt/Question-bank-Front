/**
 * @file ReaderAudioControls.jsx
 * @description Reader toolbar control for Narration / Music.
 * Driven by the shared engine (useReaderAudioEngine) through
 * ReaderAudioContext. The mode only picks which channel the buttons control;
 * switching it never stops anything.
 * Narration: docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md.
 * Narration speed: docs/2026-10-10/READER_NARRATION_SPEED_PLAN.md.
 * Music: docs/2026-10-10/READER_MUSIC_PLAN.md.
 */

import React from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Popover,
  Slider,
  Tooltip,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import { useReaderAudio } from "../Studio/context/ReaderAudioContext";
import { AUDIO_MODES } from "../Studio/hooks/useReaderAudioEngine";
import {
  NARRATION_STATUS,
  PLAYBACK_RATES,
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

/** Volume slider + mute button for one audio channel. */
const VolumeColumn = ({ mode, channel }) => {
  const { label, Icon } = mode;
  const { volume, isMuted } = channel;
  const name = label.toLowerCase();

  return (
    <div className={styles["volume-column"]}>
      <Tooltip title={label}>
        <Icon fontSize="small" className={styles["volume-icon"]} />
      </Tooltip>
      <Slider
        size="small"
        orientation="vertical"
        aria-label={`${name} volume`}
        value={isMuted ? 0 : volume}
        onChange={(_, value) => channel.setVolume(value)}
        className={styles.slider}
      />
      <Tooltip title={`${isMuted ? "Unmute" : "Mute"} ${name}`}>
        <IconButton
          size="small"
          aria-label={`${isMuted ? "unmute" : "mute"} ${name}`}
          onClick={channel.toggleMute}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

const ReaderAudioControls = () => {
  const audio = useReaderAudio();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [volumeAnchor, setVolumeAnchor] = React.useState(null);
  const [speedAnchor, setSpeedAnchor] = React.useState(null);
  // One hidden picker per toolbar instance; both feed the same music engine.
  const fileInputRef = React.useRef(null);

  if (!audio) return null;

  const { narration, music } = audio;
  const { hasNarration, playbackRate } = narration;
  const mode =
    Object.values(MODES).find((m) => m.id === audio.mode) || MODES.NARRATION;
  const isNarration = mode.id === AUDIO_MODES.NARRATION;
  const channel = isNarration ? narration : music;
  const otherChannel = isNarration ? music : narration;
  const isPlaying = channel.status === NARRATION_STATUS.PLAYING;
  // The dot tells the reader that sound comes from the channel not on screen.
  const isOtherPlaying = otherChannel.status === NARRATION_STATUS.PLAYING;
  const otherLabel = isNarration ? MODES.MUSIC.label : MODES.NARRATION.label;
  const isSilent = (c) => c.isMuted || c.volume === 0;
  const isAllMuted = isSilent(narration) && isSilent(music);
  const isPlayDisabled = isNarration && !hasNarration;
  const isSkipDisabled = narration.status === NARRATION_STATUS.IDLE;

  const onSelectMode = (nextMode) => {
    audio.setMode(nextMode.id);
    setMenuAnchor(null);
  };

  const onSelectSpeed = (value) => {
    narration.setPlaybackRate(value);
    setSpeedAnchor(null);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const onSelectTrack = (id) => {
    music.selectTrack(id);
    audio.setMode(AUDIO_MODES.MUSIC);
    setMenuAnchor(null);
  };

  const onChooseFile = () => {
    setMenuAnchor(null);
    openFilePicker();
  };

  const onFileChange = (event) => {
    const [file] = event.target.files || [];
    // Reset so picking the same file again still fires `change`.
    event.target.value = "";
    if (!file) return;
    music.loadFile(file);
    audio.setMode(AUDIO_MODES.MUSIC);
  };

  const onTogglePlay = () => {
    if (!isNarration) {
      if (isPlaying) music.pause();
      else if (!music.play()) openFilePicker();
      return;
    }
    if (isPlaying) narration.pause();
    else narration.play();
  };

  const musicTracks = music.userTrack
    ? [...music.tracks, music.userTrack]
    : music.tracks;
  // Built-in tracks must be credited; the reader's own file has no credit.
  const musicCredit = music.currentTrack?.credit;

  const playTitle = isPlayDisabled
    ? "No narration for this page"
    : isPlaying
    ? "Pause"
    : "Play";

  const ModeIcon = mode.Icon;

  return (
    <div className={styles["reader-audio"]}>
      <Tooltip
        title={
          isOtherPlaying ? `${mode.label} · ${otherLabel} is playing` : mode.label
        }
      >
        <span className={styles["mode-icon-wrapper"]}>
          <ModeIcon className={styles["mode-icon"]} aria-label={mode.label} />
          {isOtherPlaying && (
            <span
              className={styles["mode-dot"]}
              aria-label={`${otherLabel} is playing`}
            />
          )}
        </span>
      </Tooltip>

      <div className={styles.pill}>
        {isNarration && (
          <Tooltip title="Previous block">
            <span>
              <IconButton
                size="small"
                aria-label="previous-block"
                onClick={narration.previous}
                disabled={isSkipDisabled}
              >
                <SkipPreviousIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

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

        {isNarration && (
          <Tooltip title="Next block">
            <span>
              <IconButton
                size="small"
                aria-label="next-block"
                onClick={narration.next}
                disabled={isSkipDisabled}
              >
                <SkipNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {isNarration && (
          <Tooltip title="Playback speed">
            <IconButton
              size="small"
              aria-label="playback-speed"
              aria-haspopup="true"
              aria-controls={speedAnchor ? "reader-speed-menu" : undefined}
              onClick={(e) => setSpeedAnchor(e.currentTarget)}
              className={styles["speed-button"]}
            >
              {`${playbackRate}x`}
            </IconButton>
          </Tooltip>
        )}
        <Menu
          id="reader-speed-menu"
          anchorEl={speedAnchor}
          open={Boolean(speedAnchor)}
          onClose={() => setSpeedAnchor(null)}
        >
          {PLAYBACK_RATES.map((rate) => (
            <MenuItem
              key={rate.value}
              selected={playbackRate === rate.value}
              onClick={() => onSelectSpeed(rate.value)}
            >
              <ListItemText>{rate.label}</ListItemText>
              {playbackRate === rate.value && (
                <CheckIcon fontSize="small" sx={{ ml: 2 }} />
              )}
            </MenuItem>
          ))}
        </Menu>

        <Tooltip title="Volume">
          <IconButton
            size="small"
            aria-label="volume"
            aria-haspopup="true"
            onClick={(e) => setVolumeAnchor(e.currentTarget)}
          >
            {isAllMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Tooltip>
        {/* The sliders live in a popover so the toolbar keeps a fixed width.
            Both channels are shown in either mode so the reader can balance
            them in one place. */}
        <Popover
          open={Boolean(volumeAnchor)}
          anchorEl={volumeAnchor}
          onClose={() => setVolumeAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <div className={styles["volume-popover"]}>
            <VolumeColumn mode={MODES.NARRATION} channel={narration} />
            <VolumeColumn mode={MODES.MUSIC} channel={music} />
          </div>
        </Popover>
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
        <Divider />
        <ListSubheader className={styles["menu-subheader"]}>
          Music track
        </ListSubheader>
        {musicTracks.map((track) => {
          const isCurrent = music.currentTrack?.id === track.id;
          return (
            <MenuItem
              key={track.id}
              selected={isCurrent}
              onClick={() => onSelectTrack(track.id)}
            >
              <ListItemText inset>{track.label}</ListItemText>
              {isCurrent && <CheckIcon fontSize="small" sx={{ ml: 2 }} />}
            </MenuItem>
          );
        })}
        <MenuItem onClick={onChooseFile}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Choose a file…</ListItemText>
        </MenuItem>
        {musicCredit && <Divider />}
        {musicCredit && (
          <li className={styles["music-credit"]} role="none">
            Music: “{music.currentTrack.label}” by {musicCredit.artist} ·{" "}
            <a
              href={musicCredit.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              {musicCredit.license}
            </a>
          </li>
        )}
      </Menu>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={onFileChange}
      />
    </div>
  );
};

export default ReaderAudioControls;
