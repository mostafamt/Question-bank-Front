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
  const { data: pages = [], isFetching } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });
  const [outerValue, setOuterValue] = React.useState(0); // top-level tabs
  const [innerValue, setInnerValue] = React.useState(0); // nested tabs
  const [activePage, setActivePage] = useState(null);
  const thumbnailsRef = React.useRef(null);

  React.useEffect(() => {
    if (pages?.length) {
      setActivePage(pages[INITIAL_PAGE_INDEX]);
    }
  }, [pages]);

  const onChangeActivePage = (action, source = "thumbnails") => {
    setActivePage((prevPage) => {
      let newPage = prevPage;

      // Case 1: Direct page object
      if (typeof action === "object" && action?._id) {
        newPage = action;
      } else {
        // Case 2: Action string
        const currentIndex = pages.findIndex((p) => p._id === prevPage._id);

        switch (action) {
          case "next":
            newPage = pages[Math.min(currentIndex + 1, pages.length - 1)];
            break;
          case "prev":
            newPage = pages[Math.max(currentIndex - 1, 0)];
            break;
          case "first":
            newPage = pages[0];
            break;
          case "last":
            newPage = pages[pages.length - 1];
            break;
          default:
            newPage = prevPage;
        }
      }

      if (thumbnailsRef.current) {
        const container = thumbnailsRef.current;
        const index = pages.findIndex((p) => p._id === newPage._id);

        if (index !== -1) {
          const btn = container.querySelector(`button:nth-child(${index + 1})`);
          if (btn) {
            const offset = container.clientHeight * 0.03; // 3% of container height

            container.scrollTo({
              top: btn.offsetTop - offset,
              behavior: "smooth",
            });
          }
        }
      }

      return newPage;
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
  const InnerComponent = innerTab.component;

  return (
    <BookHeaderLayout>
      <BookTabsLayout
        pages={pages}
        chapterId={chapterId}
        activePage={activePage}
        setActivePage={setActivePage}
        onChangeActivePage={onChangeActivePage}
        ref={thumbnailsRef}
      >
        <InnerComponent
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          onChangeActivePage={onChangeActivePage}
        />
      </BookTabsLayout>
    </BookHeaderLayout>
  );
};

export default Book;
