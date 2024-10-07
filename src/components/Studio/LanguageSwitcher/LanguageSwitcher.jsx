import { Box } from "@mui/material";
import React from "react";
import { useStore } from "../../../store/store";

const LanguageSwitcher = () => {
  const { data: state, setFormState } = useStore();

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
      <button
        style={{ backgroundColor: "#eee", border: 0 }}
        onClick={() => {
          setFormState({ ...state, language: "en" });
        }}
      >
        EN
      </button>
      <button
        style={{ backgroundColor: "#eee", border: 0 }}
        onClick={() => {
          setFormState({ ...state, language: "ar" });
        }}
      >
        AR
      </button>
    </Box>
  );
};

export default LanguageSwitcher;
