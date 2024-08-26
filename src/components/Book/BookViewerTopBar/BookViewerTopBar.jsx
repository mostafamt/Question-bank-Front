import React from "react";
import { IconButton, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";

import styles from "./bookViewerTopBar.module.scss";
import { getTotalPages } from "../../../utils/book";

const BookViewerTopBar = (props) => {
  const { activePage, onChangePage } = props;

  const onClickNextPage = () => {
    onChangePage("next");
  };
  const onClickPreviousPage = () => {
    onChangePage("previous");
  };

  const onClickFirstPage = () => {
    onChangePage("first");
  };

  const onClickLastPage = () => {
    onChangePage("last");
  };

  return (
    <div className={styles.bookViewerTopBar}>
      <Typography variant="caption" component="h5">
        Page {activePage.order} of {getTotalPages()}
      </Typography>

      <IconButton aria-label="first" onClick={onClickFirstPage}>
        <FirstPageIcon />
      </IconButton>
      <IconButton aria-label="previous" onClick={onClickPreviousPage}>
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton aria-label="next" onClick={onClickNextPage}>
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton aria-label="next" onClick={onClickLastPage}>
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

export default BookViewerTopBar;
