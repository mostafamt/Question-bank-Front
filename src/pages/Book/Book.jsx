import React, { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AppBar, Tabs, Tab, CircularProgress } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookIcon from "@mui/icons-material/Book";
import StudyBook from "../../components/StudyBook/StudyBook";
import BookContentLayout from "../../layouts/StudyBookLayout/StudyBookLayout";
import { getChapterPages } from "../../api/bookapi";
import { INITIAL_PAGE_INDEX } from "../../utils/book";
import BookReaderLayout from "../../layouts/BookReaderLayout/BookReaderLayout";
import { tabsConfig } from "../../config/reader";
import StudyBookLayout from "../../layouts/StudyBookLayout/StudyBookLayout";

const tabsStyle = {
  width: "100%",
  "& .MuiTabs-indicator": { backgroundColor: "transparent" },
  "& .MuiTab-root.Mui-selected": {
    backgroundColor: "primary.main",
    color: "#fff",
  },
};

const Book = () => {
  const { bookId, chapterId } = useParams();
  const { data: pages, isFetching } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });
  const [outerValue, setOuterValue] = React.useState(0); // top-level tabs
  const [innerValue, setInnerValue] = React.useState(0); // nested tabs
  const [activePage, setActivePage] = React.useState(
    pages?.[INITIAL_PAGE_INDEX] || ""
  );

  if (isFetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const outerTab = tabsConfig[outerValue];
  const innerTab = outerTab.children[innerValue];

  return (
    <BookReaderLayout>
      <StudyBookLayout
        pages={pages}
        chapterId={chapterId}
        activePage={activePage}
        setActivePage={setActivePage}
      >
        {React.cloneElement(innerTab.component, {
          activePage,
          setActivePage,
        })}
      </StudyBookLayout>
    </BookReaderLayout>
  );
};

export default Book;
