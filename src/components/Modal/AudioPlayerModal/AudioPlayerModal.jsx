import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Alert } from "@mui/material";

/**
 * AudioPlayerModal Component
 * Plays an audio block in reader mode.
 *
 * @param {Object} props
 * @param {string} props.url - Audio URL
 * @param {string} [props.title] - Modal title
 */
const AudioPlayerModal = ({ url, title = "Audio" }) => {
  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {url ? (
          <audio src={url} controls autoPlay style={{ width: "100%" }}>
            Your browser does not support the audio element.
          </audio>
        ) : (
          <Alert severity="warning">No audio URL is available.</Alert>
        )}
      </BootstrapModal.Body>
    </>
  );
};

export default AudioPlayerModal;
