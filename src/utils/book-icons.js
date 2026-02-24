import CollectionsIcon from "@mui/icons-material/Collections";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // fallback

/**
 * Maps column IDs to their corresponding MUI icons
 * @param {string} id - The column/tab id
 * @returns {React.Component} The corresponding MUI icon component
 */
export const getColumnIcon = (id) => {
  const iconMap = {
    thumbnails: CollectionsIcon,
    recalls: PsychologyIcon,
    "micro-learning": AutoStoriesIcon,
    "enriching-content": AutoAwesomeIcon,
    "table-of-contents": FormatListNumberedIcon,
    "glossary-keywords": LibraryBooksIcon,
    "illustrative-interactions": TouchAppIcon,
    "check-yourself-left": AssignmentTurnedInIcon,
    "check-yourself-right": AssignmentTurnedInIcon,
    "block-authoring": ContentCopyIcon,
    "composite-blocks": ContentCopyIcon,
    "exercise-left": ContentCopyIcon,
    "exercise-right": ContentCopyIcon,
  };

  // Return mapped icon or fallback to ContentCopyIcon
  return iconMap[id] || ContentCopyIcon;
};
