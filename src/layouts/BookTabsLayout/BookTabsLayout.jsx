import React from "react";
import BookThumnails from "../../components/Book/BookThumnails/BookThumnails";
import {
  changePage,
  getColumn,
  getColumnsByPosition,
  INITIAL_PAGE,
  INITIAL_PAGE_INDEX,
  PAGES,
  toggleColumn,
  LEFT_POSITION,
  ALL_COLUMNS,
  RIGHT_POSITION,
} from "../../utils/book";

import { v4 as uuidv4 } from "uuid";
import TableOfContents from "../../components/Book/TableOfContents/TableOfContents";
import BookColumns2 from "../../components/Book/BookColumn2/BookColumn2";

import styles from "./bookTabsLayout.module.scss";
import List from "../../components/Tabs/List/List";
import GlossaryAndKeywords from "../../components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords";

const RECALLS = "Recalls";
const MICRO_LEARNING = "Micro Learning";
const ENRICHING_CONTENT = "Enriching Content";
const CHECK_YOURSELF = "Check Yourself";
const ILLUSTRATIVE_INTERACTIONS = "Illustrative Interactions";

const BookTabsLayout = React.forwardRef((props, ref) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
  } = props;

  const [modalState, setModalState] = React.useState({
    open: false,
    source: null,
  });

  const openModal = (source = null) => {
    console.log("source= ", source);
    setModalState({
      open: true,
      source: source,
    });
  };

  const LEFT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Thumbnails",
      position: LEFT_POSITION,
      component: (
        <BookThumnails
          pages={newPages}
          activePage={activePage}
          setActivePage={setActivePage}
          onChangeActivePage={onChangeActivePage}
          ref={ref}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Recalls",
      position: LEFT_POSITION,
      component: <List chapterId={chapterId} tabName={RECALLS} reader />,
    },
    {
      id: uuidv4(),
      label: "Micro Learning",
      position: LEFT_POSITION,
      component: <List chapterId={chapterId} tabName={MICRO_LEARNING} reader />,
    },
    {
      id: uuidv4(),
      label: "Enriching Contents",
      position: LEFT_POSITION,
      component: (
        <List chapterId={chapterId} tabName={ENRICHING_CONTENT} reader />
      ),
    },
  ];

  const RIGHT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Table Of Contents",
      position: LEFT_POSITION,
      component: (
        <TableOfContents
          pages={newPages}
          setActivePage={setActivePage}
          chapterId={chapterId}
          onChangeActivePage={onChangeActivePage}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Glossary & keywords",
      position: LEFT_POSITION,
      component: <GlossaryAndKeywords chapterId={chapterId} />,
    },
    {
      id: uuidv4(),
      label: "Illustrative Interactions",
      position: LEFT_POSITION,
      component: (
        <List
          chapterId={chapterId}
          tabName={ILLUSTRATIVE_INTERACTIONS}
          reader
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Check Yourself",
      position: LEFT_POSITION,
      component: <List chapterId={chapterId} tabName={CHECK_YOURSELF} reader />,
    },
  ];

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumns2
        columns={LEFT_COLUMNS}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div>{children}</div>
      <BookColumns2 columns={RIGHT_COLUMNS} />
    </div>
  );
});

export default BookTabsLayout;
