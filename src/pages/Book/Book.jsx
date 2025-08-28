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

  const onChangeActivePage = (action) => {
    setActivePage((prevPage) => {
      // Case 1: Direct page object
      if (typeof action === "object" && action?._id) {
        return action;
      }

      // Case 2: Action string
      const currentIndex = pages.findIndex((p) => p._id === prevPage._id);

      switch (action) {
        case "next":
          return pages[Math.min(currentIndex + 1, pages.length - 1)];
        case "prev":
          return pages[Math.max(currentIndex - 1, 0)];
        case "first":
          return pages[0];
        case "last":
          return pages[pages.length - 1];
        default:
          return prevPage;
      }
    });
  };

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
        onChangeActivePage={onChangeActivePage}
      >
        {React.cloneElement(innerTab.component, {
          activePage,
          setActivePage,
          onChangeActivePage,
        })}
      </StudyBookLayout>
    </BookReaderLayout>
  );
};

export default Book;
