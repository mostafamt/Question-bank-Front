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
 * Maps column labels to their corresponding MUI icons
 * @param {string} label - The column label
 * @returns {React.Component} The corresponding MUI icon component
 */
export const getColumnIcon = (label) => {
  const iconMap = {
    Thumbnails: CollectionsIcon,
    Recalls: PsychologyIcon,
    "Micro Learning": AutoStoriesIcon,
    "Enriching Contents": AutoAwesomeIcon,
    "Table Of Contents": FormatListNumberedIcon,
    "Glossary & keywords": LibraryBooksIcon,
    "Illustrative Interactions": TouchAppIcon,
    "Check Yourself": AssignmentTurnedInIcon,
  };

  // Return mapped icon or fallback to ContentCopyIcon
  return iconMap[label] || ContentCopyIcon;
};
