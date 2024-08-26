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
  const { tabs, items } = props;
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" sx={appBarStyle}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          sx={tabsStyle}
        >
          {tabs.map((item, index) => (
            <Tab label={item} {...a11yProps(index)} />
          ))}
        </Tabs>
      </AppBar>
      {tabs.map((_, index) => (
        <TabPanel value={value} index={index}>
          <BookContentLayout>{items[index]}</BookContentLayout>
        </TabPanel>
      ))}
    </>
  );
};

const Book = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="container">
      <AppBar position="static" sx={appBarStyle}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          sx={tabsStyle}
        >
          {tabs.map((tab, index) => (
            <Tab
              icon={<MenuBookIcon />}
              iconPosition="start"
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </AppBar>
      {tabs.map((item, index) => (
        <>
          <TabPanel value={value} index={index}>
            <InnerTabs
              tabs={item.children?.labels}
              items={item.children?.items}
            />
          </TabPanel>
        </>
      ))}
    </div>
  );
};

export default Book;
