import React, { useState } from "react";
import { AppBar, Tabs, Tab } from "@mui/material";
import { tabsConfig } from "../../config/reader";

const tabsStyle = {
  width: "100%",
  "& .MuiTabs-indicator": { backgroundColor: "transparent" },
  "& .MuiTab-root.Mui-selected": {
    backgroundColor: "primary.main",
    color: "#fff",
  },
};

const BookReaderLayout = ({ children }) => {
  const [outerValue, setOuterValue] = useState(0); // top-level tabs
  const [innerValue, setInnerValue] = useState(0); // nested tabs

  const outerTab = tabsConfig[outerValue];
  const innerTab = outerTab.children[innerValue];

  return (
    <div className="container">
      {/* Outer Tabs */}
      <AppBar position="static" sx={{ bgcolor: "#eee", color: "#000" }}>
        <Tabs
          value={outerValue}
          onChange={(_, newValue) => {
            setOuterValue(newValue);
            setInnerValue(0); // reset inner tabs when switching outer
          }}
          variant="fullWidth"
          sx={tabsStyle}
        >
          {tabsConfig.map((tab, i) => (
            <Tab
              key={i}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Inner Tabs */}
      <AppBar position="static" sx={{ bgcolor: "#eee", color: "#000" }}>
        <Tabs
          value={innerValue}
          onChange={(_, newValue) => setInnerValue(newValue)}
          variant="fullWidth"
          sx={tabsStyle}
        >
          {outerTab.children.map((tab, i) => (
            <Tab key={i} label={tab.label} />
          ))}
        </Tabs>
      </AppBar>

      {/* Content */}
      {children}
    </div>
  );
};

export default BookReaderLayout;
