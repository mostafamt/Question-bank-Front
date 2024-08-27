import React from "react";
import Box from "@mui/material/Box";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { PAGES, TABLES_OF_CONTENTS } from "../../../utils/book";

const TableOfContents = (props) => {
  const { setActivePage } = props;

  const onClickItem = (item) => {
    if (item.hasOwnProperty("pageIndex")) {
      setActivePage(PAGES[item.pageIndex]);
    }
  };

  const renderTree = (tree) => {
    return tree.map((item) => (
      <TreeItem
        itemId={item.id}
        label={item.label}
        onClick={() => onClickItem(item)}
      >
        {item.children && renderTree(item.children)}
      </TreeItem>
    ));
  };

  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <SimpleTreeView>{renderTree(TABLES_OF_CONTENTS)}</SimpleTreeView>
    </Box>
  );
};

export default TableOfContents;
