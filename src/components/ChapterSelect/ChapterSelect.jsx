import React, { useRef, useState } from "react";
import {
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import styles from "./chapterSelect.module.scss";

const ChapterSelect = ({
  label,
  chapters,
  value,
  loading,
  disabled,
  onSelect,
  onBlankChapter,
  onNewVersion,
  error,
  isCopying,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const subMenuTimer = useRef(null);

  const selectedChapter = chapters?.find((c) => c._id === value);

  const openMenu = (e) => setMenuAnchor(e.currentTarget);

  const closeMenu = () => {
    setMenuAnchor(null);
    closeSubMenu();
  };

  const openSubMenu = (e, chapter) => {
    clearTimeout(subMenuTimer.current);
    setSubMenuAnchor(e.currentTarget);
    setActiveChapter(chapter);
  };

  const scheduleSubMenuClose = () => {
    subMenuTimer.current = setTimeout(() => {
      setSubMenuAnchor(null);
      setActiveChapter(null);
    }, 250);
  };

  const cancelSubMenuClose = () => clearTimeout(subMenuTimer.current);

  const closeSubMenu = () => {
    clearTimeout(subMenuTimer.current);
    setSubMenuAnchor(null);
    setActiveChapter(null);
  };

  const handleSelectExisting = () => {
    if (activeChapter) onSelect(activeChapter._id);
    closeMenu();
  };

  const handleNewVersion = () => {
    if (activeChapter) onNewVersion(activeChapter._id);
    closeMenu();
  };

  const handleBlankChapter = () => {
    onBlankChapter();
    closeMenu();
  };

  return (
    <label className={styles.wrap}>
      <span>{label}</span>
      {loading ? (
        <CircularProgress size="1.5rem" />
      ) : (
        <button
          type="button"
          className={styles.trigger}
          onClick={openMenu}
          disabled={disabled || isCopying}
        >
          <span className={!selectedChapter && !isCopying ? styles.placeholder : ""}>
            {isCopying
              ? "Copying..."
              : selectedChapter?.title ?? "--Select an option--"}
          </span>
          {isCopying ? (
            <CircularProgress size="1rem" />
          ) : (
            <ArrowDropDownIcon fontSize="small" />
          )}
        </button>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{ sx: { minWidth: menuAnchor?.offsetWidth } }}
      >
        <MenuItem onClick={handleBlankChapter}>
          <ListItemText primary="Blank Chapter" />
        </MenuItem>
        {chapters?.length > 0 && <Divider />}
        {chapters?.map((chapter) => (
          <MenuItem
            key={chapter._id}
            selected={value === chapter._id}
            onMouseEnter={(e) => openSubMenu(e, chapter)}
            onMouseLeave={scheduleSubMenuClose}
          >
            <ListItemText primary={chapter.title} />
            <ChevronRightIcon fontSize="small" sx={{ ml: 1, opacity: 0.5 }} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={subMenuAnchor}
        open={Boolean(subMenuAnchor)}
        onClose={closeSubMenu}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        style={{ pointerEvents: "none" }}
        PaperProps={{
          style: { pointerEvents: "auto" },
          onMouseEnter: cancelSubMenuClose,
          onMouseLeave: scheduleSubMenuClose,
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <MenuItem onClick={handleNewVersion}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="New Version" />
        </MenuItem>
        <MenuItem onClick={handleSelectExisting}>
          <ListItemIcon>
            <CheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Existing Version" />
        </MenuItem>
      </Menu>
    </label>
  );
};

export default ChapterSelect;
