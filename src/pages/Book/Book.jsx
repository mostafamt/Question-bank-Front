import React, { useState, useMemo } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AppBar, Tabs, Tab, CircularProgress } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookIcon from "@mui/icons-material/Book";
import StudyBook from "../../components/StudyBook/StudyBook";
import BookContentLayout from "../../layouts/BookContentLayout/BookContentLayout";
import { getChapterPages } from "../../api/bookapi";
import { INITIAL_PAGE_INDEX } from "../../utils/book";

const tabsConfig = [
  {
    label: "The Book",
    icon: <MenuBookIcon />,
    children: [
      { label: "Study Book", component: <StudyBook /> },
      { label: "Work Book", component: <div>Work Book</div> },
      { label: "Activity Book", component: <div>Activity Book</div> },
    ],
  },
  {
    label: "Review Book",
    icon: <BookIcon />,
    children: [
      { label: "Review Booklet", component: <div>Review Booklet</div> },
      {
        label: "Exam Style Questions",
        component: <div>Exam Style Questions</div>,
      },
      { label: "Check Yourself", component: <div>Check Yourself</div> },
      { label: "Headlights Booklet", component: <div>Headlights Booklet</div> },
    ],
  },
];

const tabsStyle = {
  width: "100%",
  "& .MuiTabs-indicator": { backgroundColor: "transparent" },
  "& .MuiTab-root.Mui-selected": {
    backgroundColor: "primary.main",
    color: "#fff",
  },
};

const TabPanel = ({ value, index, children }) =>
  value === index ? <div role="tabpanel">{children}</div> : null;

const InnerTabs = ({ chapterId, pages, tabs }) => {
  const [value, setValue] = useState(0);
  const [activePage, setActivePage] = useState(
    pages?.[INITIAL_PAGE_INDEX] || ""
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "#eee", color: "#000" }}>
        <Tabs
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          variant="fullWidth"
          sx={tabsStyle}
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} />
          ))}
        </Tabs>
      </AppBar>

      {tabs.map((tab, i) => (
        <TabPanel key={i} value={value} index={i}>
          <BookContentLayout
            pages={pages}
            chapterId={chapterId}
            activePage={activePage}
            setActivePage={setActivePage}
          >
            {React.cloneElement(tab.component, { activePage, setActivePage })}
          </BookContentLayout>
        </TabPanel>
      ))}
    </>
  );
};

const Book = () => {
  const { bookId, chapterId } = useParams();
  const { data: pages, isFetching } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });

  const [outerValue, setOuterValue] = useState(0);

  if (isFetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container">
      <AppBar position="static" sx={{ bgcolor: "#eee", color: "#000" }}>
        <Tabs
          value={outerValue}
          onChange={(_, newValue) => setOuterValue(newValue)}
          variant="fullWidth"
          sx={tabsStyle}
        >
          {tabsConfig.map((tab, i) => (
            <Tab
              key={i}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>
      </AppBar>

      {tabsConfig.map((tab, i) => (
        <TabPanel key={i} value={outerValue} index={i}>
          <InnerTabs chapterId={chapterId} pages={pages} tabs={tab.children} />
        </TabPanel>
      ))}
    </div>
  );
};

export default Book;
