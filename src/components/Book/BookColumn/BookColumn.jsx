import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import BookColumnHeader from "../BookColumnHeader/BookColumnHeader";
import PanelSheet from "../../Studio/components/PanelSheet";
import useMinimizeOnNavigate from "../../Studio/hooks/useMinimizeOnNavigate";
import useBreakpoint from "../../../hooks/useBreakpoint";
import { getColumnIcon } from "../../../utils/book-icons";
import { getTabLabel } from "../../../utils/tabFiltering";
import { useStore } from "../../../store/store";

import styles from "./bookColumn.module.scss";

const BookColumn = (props) => {
  const {
    COLUMNS,
    onImageLoad,
    activeTab,
    setActiveTab,
    // Studio only: below desktop render an icon rail + slide-over drawer
    responsive = false,
    side = "left",
    navigationKey,
  } = props;
  const language = useStore((s) => s.language);
  const { isDesktop } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useMinimizeOnNavigate(navigationKey, () => setDrawerOpen(false));

  const onChangeActiveTab = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      onImageLoad();
    }, 50);
  };

  if (responsive && !isDesktop) {
    const activeColumn = COLUMNS.find((column) => column.id === activeTab?.id);

    const onClickRailTab = (column) => {
      if (column.id === activeTab?.id) {
        setDrawerOpen((open) => !open);
      } else {
        onChangeActiveTab(column);
        setDrawerOpen(true);
      }
    };

    return (
      <div className={styles["book-column-rail"]}>
        {COLUMNS.map((column) => {
          const IconComponent = getColumnIcon(column.id);
          const label = getTabLabel(column.label, language);
          const isActive = column.id === activeTab?.id;
          return (
            <Tooltip
              key={column.id}
              title={label}
              placement={side === "left" ? "right" : "left"}
            >
              <IconButton
                aria-label={label}
                aria-pressed={isActive}
                color={isActive ? "primary" : "default"}
                className={isActive ? styles.active : undefined}
                onClick={() => onClickRailTab(column)}
              >
                <IconComponent />
              </IconButton>
            </Tooltip>
          );
        })}
        <PanelSheet
          anchor={side}
          open={drawerOpen && Boolean(activeColumn)}
          title={activeColumn ? getTabLabel(activeColumn.label, language) : ""}
          onMinimize={() => setDrawerOpen(false)}
          onClose={() => {
            setDrawerOpen(false);
            onChangeActiveTab("");
          }}
        >
          {activeColumn?.component}
        </PanelSheet>
      </div>
    );
  }

  let content = <></>;
  if (activeTab) {
    COLUMNS.forEach((column) => {
      if (column.id === activeTab.id) {
        content = (
          <div style={{ minHeight: "100%" }}>
            <BookColumnHeader
              columnName={getTabLabel(column.label, language)}
              close={() => onChangeActiveTab("")}
            />
            {column.component}
          </div>
        );
      }
    });
  } else {
    content = (
      <div className={styles["tabs"]}>
        {COLUMNS.map((column) => {
          const IconComponent = getColumnIcon(column.id);
          return (
            <button key={column.id} onClick={() => onChangeActiveTab(column)}>
              <span>{getTabLabel(column.label, language)}</span>
              <IconComponent />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={styles["book-column"]}
      style={
        activeTab
          ? { flex: `0 0 ${20}%` }
          : { flex: `0 0 2.6%`, overflow: "hidden" }
      }
    >
      {content}
    </div>
  );
};

export default BookColumn;
