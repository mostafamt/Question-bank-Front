import React from "react";
import { useQuery } from "@tanstack/react-query";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import { getLanguages } from "../../../services/api";
import { OCR_LANGUAGE_BY_CODE } from "../../../utils/ocr";

import styles from "./languageSwitcher.module.scss";

// Used until the API answers, or if it fails.
const FALLBACK_LANGUAGES = [
  { label: "English", code: "en" },
  { label: "Arabic", code: "ar" },
];

const LABEL = "OCR language";

const LanguageSwitcher = (props) => {
  const { language, setLanguage } = props;

  const { data } = useQuery({
    queryKey: ["languages"],
    queryFn: getLanguages,
    staleTime: Infinity,
  });

  // Only offer languages OCR can read.
  const languages = (data?.length ? data : FALLBACK_LANGUAGES).filter(
    (l) => OCR_LANGUAGE_BY_CODE[l.code]
  );

  return (
    <div className={styles["language-switcher"]}>
      <Tooltip
        title="Language used to read text from the areas you select on the page"
        placement="left"
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="ocr-language-label">{LABEL}</InputLabel>
          <Select
            labelId="ocr-language-label"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            input={
              <OutlinedInput
                label={LABEL}
                startAdornment={
                  <InputAdornment position="start">
                    <DocumentScannerIcon fontSize="small" />
                  </InputAdornment>
                }
              />
            }
            sx={{ bgcolor: "#fff" }}
          >
            {languages.map((l) => (
              <MenuItem key={l.code} value={OCR_LANGUAGE_BY_CODE[l.code]}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>
    </div>
  );
};

export default LanguageSwitcher;
