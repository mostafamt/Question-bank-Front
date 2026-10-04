import { v4 as uuidv4 } from "uuid";

export const mapTableOfContents = (TABLES_OF_CONTENTS) => {
  // Handle non-array inputs gracefully
  if (!TABLES_OF_CONTENTS || !Array.isArray(TABLES_OF_CONTENTS)) {
    return [];
  }

  return TABLES_OF_CONTENTS.map((item) => {
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
