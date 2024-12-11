import { v4 as uuidv4 } from "uuid";
import BookThumnails from "../components/Book/BookThumnails/BookThumnails";
import TableOfContents from "../components/Book/TableOfContents/TableOfContents";

export const COLUMN_PERCENTAGE_MINIMIZED = 1;
export const COLUMN_PERCENTAGE_OPENED = 15;
export const INITIAL_PAGE_INDEX = 0;

// areas: [
//   {
//     id: uuidv4(),
//     x: 14,
//     y: 25,
//     width: 75,
//     height: 16.5,
//   },
//   {
//     id: uuidv4(),
//     x: 14,
//     y: 43,
//     width: 75,
//     height: 16.5,
//   },
//   {
//     id: uuidv4(),
//     x: 14,
//     y: 60,
//     width: 75,
//     height: 16.5,
//   },
//   {
//     id: uuidv4(),
//     x: 14,
//     y: 78,
//     width: 75,
//     height: 9,
//   },
// ],

export const PAGES = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: uuidv4(),
    order: index + 1,
    src: `/assets/biology book/page-${(index + 1)
      .toString()
      .padStart(2, "0")}.jpg`,
    areas: [
      {
        id: uuidv4(),
        x: 14,
        y: 25,
        width: 75,
        height: 16.5,
      },
      {
        id: uuidv4(),
        x: 14,
        y: 43,
        width: 75,
        height: 16.5,
      },
      {
        id: uuidv4(),
        x: 14,
        y: 60,
        width: 75,
        height: 16.5,
      },
      {
        id: uuidv4(),
        x: 14,
        y: 78,
        width: 75,
        height: 9,
      },
    ],
  }));

export const mapTableOfContents = (TABLES_OF_CONTENTS) => {
  return TABLES_OF_CONTENTS?.map((item) => {
    return {
      id: uuidv4(),
      title: item.title,
      pageIndex:
        Number.parseInt(item.pagesRange?.[0]) > 0
          ? Number.parseInt(item.pagesRange?.[0]) - 1
          : Number.parseInt(item.pagesRange?.[0]) || null,
      children: mapTableOfContents(item.children) || [],
    };
  });
};

// export const PAGES = [
//   {
//     id: uuidv4(),
//     src: "/assets/biology book/page-01.jpg",
//     areas: [],
//   },
//   {
//     id: uuidv4(),
//     src: "/assets/biology book/page-02.jpg",
//     areas: [],
//   },
// ];
export const INITIAL_PAGE = PAGES[INITIAL_PAGE_INDEX];

export const getTotalPages = (pages) => pages?.length || 0;

export const getPageOrderByPageId = (pages, id) =>
  pages?.findIndex((page) => page._id === id) + 1;

export const toggleColumn = (columns, id) => {
  // console.log("columns= ", columns);
  // return columns;
  return columns.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        percentage:
          item.percentage === COLUMN_PERCENTAGE_MINIMIZED
            ? COLUMN_PERCENTAGE_OPENED
            : COLUMN_PERCENTAGE_MINIMIZED,
        minimized: !item.minimized,
      };
    }
    return item;
  });
};

export const getColumn = (label) => ({
  id: uuidv4(),
  label: label,
  percentage: 20,
  minimized: false,
});

const fixArrayBoundaries = (length, index) => {
  index = index === length ? 0 : index;
  index = index === -1 ? length - 1 : index;

  return index;
};

export const changePage = (pages, currentPage, state = "next") => {
  let indexOfCurrentPage = pages.findIndex(
    (page) => page._id === currentPage._id
  );

  if (state === "next") {
    indexOfCurrentPage++;
  } else if (state === "previous") {
    indexOfCurrentPage--;
  } else if (state === "first") {
    indexOfCurrentPage = 0;
  } else if (state === "last") {
    indexOfCurrentPage = pages.length - 1;
  }
  indexOfCurrentPage = fixArrayBoundaries(pages.length, indexOfCurrentPage);

  return pages[indexOfCurrentPage];
};

export const LEFT_POSITION = "LEFT";
export const RIGHT_POSITION = "RIGHT";

export const ALL_COLUMNS = [
  {
    id: uuidv4(),
    label: "Thumbnails",
    position: LEFT_POSITION,
    component: <BookThumnails />,
  },
  {
    id: uuidv4(),
    label: "Block Authoring",
    position: LEFT_POSITION,
    component: (
      <div>
        <h1>Block Authoring</h1>
      </div>
    ),
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
  {
    id: uuidv4(),
    label: "Table Of Contents",
    position: LEFT_POSITION,
    component: <TableOfContents />,
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

export const getColumnsByPosition = (position) => {
  return ALL_COLUMNS.filter((column) => column.position === position);
};
