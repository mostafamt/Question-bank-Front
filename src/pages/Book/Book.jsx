import React, { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { getChapterPages } from "../../api/bookapi";
import { INITIAL_PAGE_INDEX } from "../../utils/book";
import { tabsConfig } from "../../config/reader";
import BookHeaderLayout from "../../layouts/BookHeaderLayout/BookHeaderLayout";
import BookTabsLayout from "../../layouts/BookTabsLayout/BookTabsLayout";

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
    <BookHeaderLayout>
      <BookTabsLayout
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
      </BookTabsLayout>
    </BookHeaderLayout>
  );
};

export default Book;
