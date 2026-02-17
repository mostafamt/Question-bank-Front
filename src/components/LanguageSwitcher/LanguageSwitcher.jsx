import React from "react";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useStore } from "../../store/store";

const FlagEN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
    <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const FlagAR = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" width="24" height="16">
    <rect width="24" height="5.33" fill="#006C35"/>
    <rect y="5.33" width="24" height="5.33" fill="#fff"/>
    <rect y="10.66" width="24" height="5.34" fill="#000"/>
    <polygon points="0,0 8,8 0,16" fill="#CE1126"/>
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
