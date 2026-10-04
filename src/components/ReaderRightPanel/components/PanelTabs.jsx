import React from "react";
import { Tabs, Tab } from "@mui/material";

const tabsStyle = {
  minHeight: 40,
  borderBottom: "1px solid #d6dee6",
  "& .MuiTabs-indicator": { backgroundColor: "transparent" },
  "& .MuiTab-root": { minHeight: 40, fontWeight: 500, textTransform: "none" },
  "& .MuiTab-root.Mui-selected": {
    backgroundColor: "#5b93c6",
    color: "#fff",
  },
};

/** The two top-level tabs (e.g. "Study Book" / "Review Booklets"). */
const PanelTabs = ({ tabs, activeTabId, onChange }) => {
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);

  return (
    <Tabs
      value={activeIndex === -1 ? 0 : activeIndex}
      onChange={(_, index) => onChange(tabs[index].id)}
      variant="fullWidth"
      sx={tabsStyle}
    >
      {tabs.map((tab) => (
        <Tab key={tab.id} label={tab.title} />
      ))}
    </Tabs>
  );
};

export default PanelTabs;
