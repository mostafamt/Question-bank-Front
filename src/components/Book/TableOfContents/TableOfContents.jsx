import React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { mapTableOfContents } from "../../../utils/book";
import { getChapterTOC } from "../../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
// TABLES_OF_CONTENTS

const TableOfContents = (props) => {
  console.log("TableOfContents");
  const { PAGES, setActivePage, chapterId } = props;

  const { data: TABLES_OF_CONTENTS, isFetching } = useQuery({
    queryKey: [`toc`],
    queryFn: () => getChapterTOC(chapterId),
    refetchOnWindowFocus: false,
  });

  const onClickItem = (item) => {
    console.log("item= ", item);
    if (item.hasOwnProperty("pageIndex") && item.pageIndex) {
      setActivePage(PAGES[item.pageIndex]);
    }
  };

  const renderTree = (tree) => {
    return tree?.map((item) => (
      <TreeItem
        key={item.id}
        itemId={item.id}
        label={item.title}
        onClick={() => onClickItem(item)}
      >
        {item.children && renderTree(item?.children)}
      </TreeItem>
    ));
  };

  const newTableOfContents = React.useMemo(
    () => mapTableOfContents(TABLES_OF_CONTENTS),
    [TABLES_OF_CONTENTS]
  );

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      {isFetching ? (
        <CircularProgress size="1rem" />
      ) : (
        <SimpleTreeView>{renderTree(newTableOfContents)}</SimpleTreeView>
      )}
    </Box>
  );
};

export default TableOfContents;
