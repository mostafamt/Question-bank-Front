import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getPageOrderByPageId, getTotalPages } from "../../../utils/book";

import styles from "./bookViewerTopBar.module.scss";

const BookViewerTopBar = (props) => {
  const {
    activePage,
    pages,
    showVB,
    setShowVB,
    onChangeActivePage,
  } = props;

  const onClickNextPage = () => {
    onChangeActivePage("next");
  };
  const onClickPreviousPage = () => {
    onChangeActivePage("prev");
  };

  const onClickFirstPage = () => {
    onChangeActivePage("first");
  };

  const onClickLastPage = () => {
    onChangeActivePage("last");
  };

  const onClickShowVirtualBlocks = () => {
    setShowVB((prevState) => !prevState);
  };

  return (
    <div className={styles.bookViewerTopBar}>
      <Typography variant="caption" component="h5">
        Page {getPageOrderByPageId(pages, activePage?._id)} of{" "}
        {getTotalPages(pages)}
      </Typography>

      <Tooltip title="First page">
        <IconButton aria-label="First page" onClick={onClickFirstPage}>
          <FirstPageIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Previous page">
        <IconButton aria-label="Previous page" onClick={onClickPreviousPage}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Next page">
        <IconButton aria-label="Next page" onClick={onClickNextPage}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Last page">
        <IconButton aria-label="Last page" onClick={onClickLastPage}>
          <LastPageIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={showVB ? "Hide virtual blocks" : "Show virtual blocks"}>
        <IconButton
          aria-label={showVB ? "Hide virtual blocks" : "Show virtual blocks"}
          onClick={onClickShowVirtualBlocks}
        >
          {showVB ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default BookViewerTopBar;
