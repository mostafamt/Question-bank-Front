import React from "react";
import { IconButton, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getPageOrderByPageId, getTotalPages } from "../../../utils/book";

import styles from "./bookViewerTopBar.module.scss";

const BookViewerTopBar = (props) => {
  const { activePage, onChangePage, pages, showVB, setShowVB } = props;

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

  const onClickShowVirtualBlocks = () => {
    setShowVB((prevState) => !prevState);
  };

  return (
    <div className={styles.bookViewerTopBar}>
      <Typography variant="caption" component="h5">
        Page {getPageOrderByPageId(pages, activePage?._id)} of{" "}
        {getTotalPages(pages)}
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
      <IconButton aria-label="show" onClick={onClickShowVirtualBlocks}>
        {showVB ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </IconButton>
    </div>
  );
};

export default BookViewerTopBar;
