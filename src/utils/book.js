import { v4 as uuidv4 } from "uuid";

export const COLUMN_PERCENTAGE_MINIMIZED = 1;
export const COLUMN_PERCENTAGE_OPENED = 15;
export const INITIAL_PAGE_INDEX = 0;
export const PAGES = [
  {
    id: uuidv4(),
    src: "/assets/page1.jpg",
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
  },
  {
    id: uuidv4(),
    src: "/assets/page2.jpg",
    areas: [],
  },
];
export const INITIAL_PAGE = PAGES[INITIAL_PAGE_INDEX];

export const toggleColumn = (columns, id) => {
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
  percentage: 15,
  minimized: false,
});

const fixArrayBoundaries = (length, index) => {
  index = index === length ? 0 : index;
  index = index === -1 ? length - 1 : index;

  return index;
};

export const changePage = (pages, currentPage, state = "next") => {
  let indexOfCurrentPage = pages.findIndex(
    (page) => page.id === currentPage.id
  );

  if (state === "next") {
    indexOfCurrentPage++;
  } else if (state === "previous") {
    indexOfCurrentPage--;
  }
  indexOfCurrentPage = fixArrayBoundaries(pages.length, indexOfCurrentPage);

  return pages[indexOfCurrentPage];
};
