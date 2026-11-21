import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { IconButton, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import clsx from "clsx";

import { useStore } from "../../../store/store";
import useBreakpoint from "../../../hooks/useBreakpoint";

import styles from "./modalHeader.module.scss";

/**
 * Header for modals rendered inside the global <Modal />.
 * Adds a full screen toggle next to the close button.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Title content
 * @param {string} [props.titleId] - id for aria-labelledby
 * @param {string} [props.titleClassName] - Extra class for the title
 * @param {boolean} [props.allowFullscreen=true] - Hide the toggle for small modals
 */
const ModalHeader = ({
  children,
  titleId,
  titleClassName,
  allowFullscreen = true,
}) => {
  const fullscreen = useStore((s) => s.modal.fullscreen);
  const toggleModalFullscreen = useStore((s) => s.toggleModalFullscreen);
  const { isPhone } = useBreakpoint();

  // Phones are always full screen, so the toggle would do nothing there
  const showToggle = allowFullscreen && !isPhone;
  const label = fullscreen ? "Exit full screen" : "Full screen";

  return (
    <BootstrapModal.Header closeButton className={styles.header}>
      <BootstrapModal.Title
        id={titleId}
        className={clsx(styles.title, titleClassName)}
      >
        {children}
      </BootstrapModal.Title>
      {showToggle && (
        <Tooltip title={label} arrow>
          <IconButton
            size="small"
            onClick={toggleModalFullscreen}
            aria-label={label}
            aria-pressed={fullscreen}
            className={styles.toggle}
          >
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </BootstrapModal.Header>
  );
};

export default ModalHeader;
