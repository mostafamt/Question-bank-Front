import React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { mapTableOfContents } from "../../../utils/book";
import { getChapterTOC } from "../../../api/bookapi";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";

import styles from "./tableOfContents.module.scss";

const TableOfContents = (props) => {
  const { pages, chapterId, onChangeActivePage } = props;

  const { data, isFetching } = useQuery({
    queryKey: [`toc`],
    queryFn: () => getChapterTOC(chapterId),
    refetchOnWindowFocus: false,
  });

  const handleClickItem = React.useCallback(
    (item) => {
      if (item?.pageIndex != null) {
        const newPage = pages[item.pageIndex];
        if (newPage) onChangeActivePage(newPage);
      }
    },
    [pages, onChangeActivePage]
  );

  const renderTree = React.useCallback(
    (tree) =>
      tree?.map((item) => (
        <TreeItem
          key={item.id}
          itemId={item.id}
          label={
            <div className={styles["tree-item"]}>
              <span>{item.title}</span>
              <span>{item.pageIndex}</span>
            </div>
          }
          onClick={() => handleClickItem(item)}
        >
          {item.children && renderTree(item?.children)}
        </TreeItem>
      )),
    [handleClickItem]
  );

  const tableOfContents = React.useMemo(() => mapTableOfContents(data), [data]);

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      {isFetching ? (
        <CircularProgress size="1rem" />
      ) : (
        <SimpleTreeView>{renderTree(tableOfContents)}</SimpleTreeView>
      )}
    </Box>
  );
};

export default TableOfContents;
