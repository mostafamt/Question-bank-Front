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

const BookTabsLayout = (props) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
  } = props;
  const [columns, setColumns] = React.useState(ALL_COLUMNS);
  const [pages, setPages] = React.useState(PAGES);
  const [showModal, setShowModal] = React.useState(false);

  // console.log("activePage= ", activePage);

  const onClickMinimize = (id) => {
    setColumns((prevState) => toggleColumn(prevState, id));
  };

  React.useEffect(() => {
    setActivePage(newPages?.[INITIAL_PAGE_INDEX]);
  }, [newPages]);

  const clonedElement = React.cloneElement(children, {
    pages,
    activePage,
    setActivePage,
    newPages,
  });

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
        />
      ),
      props: {
        activePage,
        onChangeActivePage,
      },
    },
    {
      id: uuidv4(),
      label: "Recalls",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Recalls</h1>
        </div>
      ),
    },
    {
      id: uuidv4(),
      label: "Micro Learning",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Micro Learning</h1>
        </div>
      ),
    },
    {
      id: uuidv4(),
      label: "Enriching Contents",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Enriching Contents</h1>
        </div>
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
          PAGES={newPages}
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
      component: (
        <div>
          <h1>Glossary & keywords</h1>
        </div>
      ),
    },
    {
      id: uuidv4(),
      label: "Illustrative Interactions",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Illustrative Interactions</h1>
        </div>
      ),
    },
    {
      id: uuidv4(),
      label: "Check Yourself",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Check Yourself</h1>
        </div>
      ),
    },
  ];

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumns2
        columns={LEFT_COLUMNS}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div>{clonedElement}</div>
      <BookColumns2 columns={RIGHT_COLUMNS} />
    </div>
  );
};

export default BookTabsLayout;
