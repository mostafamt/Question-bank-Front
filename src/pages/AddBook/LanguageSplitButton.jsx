import React from "react";
import { Button, ButtonGroup, ListItemIcon, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";

/**
 * Split button: a main action button plus a dropdown arrow that opens a
 * language menu. Each instance owns its own menu anchor so menus open
 * independently. Rendered as a fragment so the ButtonGroup stays a direct
 * child of the parent's `.actions` flex container (the Menu is portaled).
 *
 * @param {object} props
 * @param {string} props.label - Main button text
 * @param {React.ReactNode} props.icon - Main button start icon
 * @param {string} props.color - Background color
 * @param {string} props.hoverColor - Background color on hover
 * @param {{code: string, label: string}[]} props.languages - Menu options
 * @param {string|null} props.selectedLanguage - Currently selected code
 * @param {boolean} [props.disabled] - Disables both buttons
 * @param {object} [props.mainButtonProps] - Extra props for the main button (type, name, onClick…)
 * @param {(code: string) => void} props.onLanguageSelect - Called on item click
 */
const LanguageSplitButton = ({
  label,
  icon,
  color,
  hoverColor,
  languages,
  selectedLanguage,
  disabled = false,
  mainButtonProps = {},
  onLanguageSelect,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const hasLanguageOptions = languages.length > 0;
  const colorSx = { bgcolor: color, "&:hover": { bgcolor: hoverColor } };

  const selectedLabel = selectedLanguage
    ? languages.find((l) => l.code === selectedLanguage)?.label ||
      selectedLanguage
    : null;

  const handleItemClick = (code) => {
    setAnchorEl(null);
    onLanguageSelect(code);
  };

  return (
    <>
      <ButtonGroup variant="contained" disabled={disabled}>
        <Button type="button" startIcon={icon} sx={colorSx} {...mainButtonProps}>
          {label}
          {selectedLabel && ` (${selectedLabel})`}
        </Button>
        <Button
          type="button"
          size="small"
          aria-label={`Choose ${label} language`}
          disabled={disabled || !hasLanguageOptions}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ ...colorSx, px: 0.5 }}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {languages.map(({ code, label: languageLabel }) => (
          <MenuItem
            key={code}
            selected={selectedLanguage === code}
            onClick={() => handleItemClick(code)}
          >
            {selectedLanguage === code && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
            {languageLabel}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSplitButton;
