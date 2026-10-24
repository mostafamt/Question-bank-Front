/**
 * @file StudioMobileTabBar.jsx
 * @description Phone layout for the Studio side panels: both columns' tabs
 * merged into one bottom bar, each panel opening in a bottom sheet.
 *
 * Left and right tab state stay separate (the right tab drives the editor
 * mode), so a tab can be active while its sheet is minimized; those tabs show
 * a dot. Only one sheet is shown at a time.
 */

import React from "react";
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import PanelSheet from "./PanelSheet";
import useMinimizeOnNavigate from "../hooks/useMinimizeOnNavigate";
import { getColumnIcon } from "../../../utils/book-icons";
import { getTabLabel } from "../../../utils/tabFiltering";
import { useStore } from "../../../store/store";

// Styled via sx: MUI's own styles are injected after CSS modules and would
// win (e.g. the action's 80px min-width overflows 5 tabs on a 375px phone).
const TAB_BAR_SX = {
  flex: "none",
  height: "auto",
  minHeight: 56,
  borderTop: "1px solid #ddd",
  // Keep clear of the iPhone home indicator
  paddingBottom: "env(safe-area-inset-bottom)",
};

const ACTION_SX = {
  minWidth: 0,
  px: "2px",
  // Long panel names ("Enriching Content") must not widen the bar
  "& .MuiBottomNavigationAction-label": {
    display: "block",
    maxWidth: "100%",
    fontSize: "0.65rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .MuiBottomNavigationAction-label.Mui-selected": {
    fontSize: "0.7rem",
  },
};

/** Tabs shown in the bar itself; the rest go under "More" */
const VISIBLE_TABS = 4;

/**
 * Interleave left and right tabs so each side's most important (first) tabs
 * reach the bar: L1, R1, L2, R2, …
 */
const mergeTabs = (leftColumns, rightColumns) => {
  const merged = [];
  const length = Math.max(leftColumns.length, rightColumns.length);
  for (let i = 0; i < length; i++) {
    if (leftColumns[i]) merged.push({ side: "left", column: leftColumns[i] });
    if (rightColumns[i]) merged.push({ side: "right", column: rightColumns[i] });
  }
  return merged;
};

const StudioMobileTabBar = ({
  leftColumns,
  rightColumns,
  activeLeftTab,
  setActiveLeftTab,
  activeRightTab,
  setActiveRightTab,
  onImageLoad,
  navigationKey,
}) => {
  const language = useStore((s) => s.language);
  const [openTab, setOpenTab] = React.useState(null); // { side, id } | null
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [moreAnchor, setMoreAnchor] = React.useState(null);

  useMinimizeOnNavigate(navigationKey, () => setSheetOpen(false));

  const tabs = React.useMemo(
    () => mergeTabs(leftColumns, rightColumns),
    [leftColumns, rightColumns]
  );
  const hasMore = tabs.length > VISIBLE_TABS + 1;
  const barTabs = hasMore ? tabs.slice(0, VISIBLE_TABS) : tabs;
  const moreTabs = hasMore ? tabs.slice(VISIBLE_TABS) : [];

  const activeTabOf = (side) =>
    side === "left" ? activeLeftTab : activeRightTab;
  const setActiveTabOf = (side, tab) => {
    (side === "left" ? setActiveLeftTab : setActiveRightTab)(tab);
    setTimeout(() => {
      onImageLoad();
    }, 50);
  };
  const isActive = ({ side, column }) => activeTabOf(side)?.id === column.id;
  const isShown = ({ side, column }) =>
    sheetOpen && openTab?.side === side && openTab?.id === column.id;

  // The open tab's current column (columns are rebuilt with fresh components)
  const openColumn = openTab
    ? (openTab.side === "left" ? leftColumns : rightColumns).find(
        (column) => column.id === openTab.id
      )
    : null;
  // A tab cleared elsewhere (e.g. desktop resize back) leaves nothing to show
  const openTabStillActive =
    openTab && activeTabOf(openTab.side)?.id === openTab.id;

  const onSelectTab = (tab) => {
    setMoreAnchor(null);
    if (isShown(tab)) {
      setSheetOpen(false);
      return;
    }
    if (!isActive(tab)) setActiveTabOf(tab.side, tab.column);
    setOpenTab({ side: tab.side, id: tab.column.id });
    setSheetOpen(true);
  };

  const onClosePanel = () => {
    setSheetOpen(false);
    if (openTab) setActiveTabOf(openTab.side, "");
    setOpenTab(null);
  };

  const renderIcon = (tab) => {
    const IconComponent = getColumnIcon(tab.column.id);
    // Dot: tab is active (e.g. Block Authoring editing mode) but minimized
    return (
      <Badge
        color="primary"
        variant="dot"
        invisible={!isActive(tab) || isShown(tab)}
      >
        <IconComponent />
      </Badge>
    );
  };

  const shownTab = tabs.find(isShown);
  const moreIsShown = moreTabs.some(isShown);

  return (
    <>
      <BottomNavigation
        component="nav"
        aria-label="Panels"
        showLabels
        value={moreIsShown ? "more" : shownTab?.column.id ?? false}
        sx={TAB_BAR_SX}
      >
        {barTabs.map((tab) => {
          const label = getTabLabel(tab.column.label, language);
          return (
            <BottomNavigationAction
              key={`${tab.side}-${tab.column.id}`}
              value={tab.column.id}
              label={label}
              aria-label={label}
              title={label}
              icon={renderIcon(tab)}
              onClick={() => onSelectTab(tab)}
              sx={ACTION_SX}
            />
          );
        })}
        {hasMore && (
          <BottomNavigationAction
            value="more"
            label="More"
            aria-label="More panels"
            aria-haspopup="true"
            aria-controls={moreAnchor ? "more-panels-menu" : undefined}
            icon={
              <Badge
                color="primary"
                variant="dot"
                invisible={!moreTabs.some((t) => isActive(t) && !isShown(t))}
              >
                <MoreHorizIcon />
              </Badge>
            }
            onClick={(event) => setMoreAnchor(event.currentTarget)}
            sx={ACTION_SX}
          />
        )}
      </BottomNavigation>

      <Menu
        id="more-panels-menu"
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {moreTabs.map((tab) => (
          <MenuItem
            key={`${tab.side}-${tab.column.id}`}
            selected={isActive(tab)}
            onClick={() => onSelectTab(tab)}
          >
            <ListItemIcon>{renderIcon(tab)}</ListItemIcon>
            <ListItemText>{getTabLabel(tab.column.label, language)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <PanelSheet
        anchor="bottom"
        open={sheetOpen && Boolean(openColumn) && Boolean(openTabStillActive)}
        title={openColumn ? getTabLabel(openColumn.label, language) : ""}
        onMinimize={() => setSheetOpen(false)}
        onClose={onClosePanel}
      >
        {openTabStillActive && openColumn?.component}
      </PanelSheet>
    </>
  );
};

export default StudioMobileTabBar;
