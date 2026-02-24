import React from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useStore } from "../../store/store";

const FlagEN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 100" width="24" height="13">
    {/* Red and white stripes */}
    <rect width="190" height="100" fill="#B22234"/>
    <rect y="7.69" width="190" height="7.69" fill="#fff"/>
    <rect y="23.08" width="190" height="7.69" fill="#fff"/>
    <rect y="38.46" width="190" height="7.69" fill="#fff"/>
    <rect y="53.85" width="190" height="7.69" fill="#fff"/>
    <rect y="69.23" width="190" height="7.69" fill="#fff"/>
    <rect y="84.62" width="190" height="7.69" fill="#fff"/>
    {/* Blue canton */}
    <rect width="76" height="53.85" fill="#3C3B6E"/>
  </svg>
);

const FlagAR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" width="24" height="16">
    <rect width="24" height="5.33" fill="#CE1126"/>
    <rect y="5.33" width="24" height="5.33" fill="#fff"/>
    <rect y="10.66" width="24" height="5.34" fill="#000"/>
    <g transform="translate(12,8)" fill="#C09300">
      <path d="M-2.5,-2 C-2.5,-3.5 -1.5,-4.5 0,-4.5 C1.5,-4.5 2.5,-3.5 2.5,-2 L2.5,1 L-2.5,1 Z" fill="none" stroke="#C09300" strokeWidth="0.6"/>
      <rect x="-2" y="1" width="4" height="1.2"/>
      <rect x="-0.3" y="-3" width="0.6" height="4"/>
      <line x1="-1.5" y1="-1" x2="1.5" y2="-1" stroke="#C09300" strokeWidth="0.5"/>
    </g>
  </svg>
);

const LanguageSwitcher = () => {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  return (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      <IconButton
        onClick={() => setLanguage("en")}
        size="small"
        sx={{
          border: language === "en" ? "2px solid #fff" : "2px solid transparent",
          borderRadius: 1,
          p: 0.5,
        }}
        title="English (LTR)"
      >
        <FlagEN />
      </IconButton>
      <IconButton
        onClick={() => setLanguage("ar")}
        size="small"
        sx={{
          border: language === "ar" ? "2px solid #fff" : "2px solid transparent",
          borderRadius: 1,
          p: 0.5,
        }}
        title="العربية (RTL)"
      >
        <FlagAR />
      </IconButton>
    </Box>
  );
};

export default LanguageSwitcher;
