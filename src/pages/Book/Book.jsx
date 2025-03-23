import React from "react";
import PropTypes from "prop-types";
// import SwipeableViews from "react-swipeable-views";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookIcon from "@mui/icons-material/Book";
import StudyBook from "../../components/StudyBook/StudyBook";
import BookContentLayout from "../../layouts/BookContentLayout/BookContentLayout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getChapterPages } from "../../api/bookapi";
import CircularProgress from "@mui/material/CircularProgress";

const tabsStyle = {
  width: "100%",
  "& .MuiTabs-indicator": {
    backgroundColor: "transparent",
  },
  "& .MuiTab-root.Mui-selected": {
    backgroundColor: "primary.main",
    color: "#fff",
  },
};

const appBarStyle = {
  bgcolor: "#eee",
  color: "#000",
};

const tabs = [
  {
    label: "The Book",
    icon: <MenuBookIcon />,
    children: {
      labels: ["Study Book", "Work Book", "Activity Book"],
      items: [<StudyBook />, <div>Work Book</div>, <div>Activity Book</div>],
    },
  },
  {
    label: "Review Book",
    icon: <BookIcon />,
    children: {
      labels: [
        "Review Booklet",
        "Exam Style Questions",
        "Check Yourself",
        "Headlights Booklet",
      ],
      items: [
        <div>Review Booklet</div>,
        <div>Exam Style Questions</div>,
        <div>Check Yourself</div>,
        <div>Headlights Booklet</div>,
      ],
    },
  },
];

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const InnerTabs = (props) => {
  const { tabs, items, value, handleChange, pages, chapterId } = props;

  return (
    <>
      <AppBar position="static" sx={appBarStyle}>
        <Tabs
          value={value}
          onChange={(event, newValue) => handleChange("inner", event, newValue)}
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          sx={tabsStyle}
        >
          {tabs.map((item, index) => (
            <Tab key={index} label={item} {...a11yProps(index)} />
          ))}
        </Tabs>
      </AppBar>
      <Layout
        value={value}
        tabs={tabs}
        items={items}
        pages={pages}
        chapterId={chapterId}
      />
    </>
  );
};

const Layout = (props) => {
  const { value, tabs, items, pages, chapterId } = props;

  return tabs.map((_, index) => (
    <TabPanel key={index} value={value} index={index}>
      <BookContentLayout pages={pages} chapterId={chapterId}>
        {items[index]}
      </BookContentLayout>
    </TabPanel>
  ));
};

const Book = () => {
  const { bookId, chapterId } = useParams();

  const { data: pages, isFetching: isFetchingPages } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });

  const [value1, setValue1] = React.useState(0);
  const [value2, setValue2] = React.useState(0);

  const handleChange = (variant, event, newValue) => {
    if (variant === "outer") {
      setValue1(newValue);
    } else {
      setValue2(newValue);
    }
  };

  if (isFetchingPages) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container">
      <AppBar position="static" sx={appBarStyle}>
        <Tabs
          value={value1}
          onChange={(event, newValue) => handleChange("outer", event, newValue)}
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          sx={tabsStyle}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={<MenuBookIcon />}
              iconPosition="start"
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </AppBar>
      {tabs.map((item, index) => (
        <TabPanel key={index} value={value1} index={index}>
          <InnerTabs
            value={value2}
            handleChange={handleChange}
            tabs={item.children?.labels}
            items={item.children?.items}
            pages={pages}
            chapterId={chapterId}
          />
        </TabPanel>
      ))}
    </div>
  );
};

export default Book;
