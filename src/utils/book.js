import { v4 as uuidv4 } from "uuid";

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
    areas: [],
  }));

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

export const getTotalPages = () => PAGES.length;

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
  } else if (state === "first") {
    indexOfCurrentPage = 0;
  } else if (state === "last") {
    indexOfCurrentPage = pages.length - 1;
  }
  indexOfCurrentPage = fixArrayBoundaries(pages.length, indexOfCurrentPage);

  return pages[indexOfCurrentPage];
};
