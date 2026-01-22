import React from "react";
import { getTabObjects } from "../../../services/api";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { IconButton } from "@mui/material";

import styles from "./styles.module.scss";

const GlossaryAndKeywords = (props) => {
  const [open, setOpen] = React.useState([]);

  const handleClick = (idx) => {
    setOpen((prevState) =>
      prevState.map((item, id) => (id === idx ? !item : item))
    );
  };

  const {
    chapterId,
    changePageById,
    getBlockFromBlockId,
    hightBlock,
    navigateToBlock,
  } = props;

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: ["tab-objects-glossary"],
    queryFn: () => getTabObjects(chapterId, "glossary"),
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    setOpen(Array(tabObjects?.length).fill(false));
  }, [tabObjects]);

  if (isFetching) return <CircularProgress size="1rem" />;

  const onClickUp = (event, references) => {
    event.stopPropagation();
    if (!references?.length) {
      console.warn("No references available");
      return;
    }

    const { pageId, blockId } = references[0];

    if (navigateToBlock) {
      // Use new unified navigation function
      navigateToBlock(pageId, blockId);
    } else {
      // Fallback to original implementation (for Studio context)
      changePageById?.(pageId);
      const blockDetails = getBlockFromBlockId?.(blockId);
      hightBlock?.(blockId);
    }
  };

  const onClickDown = (event, references) => {
    event.stopPropagation();
    if (!references?.length) {
      console.warn("No references available");
      return;
    }

    const { pageId, blockId } = references[0];

    if (navigateToBlock) {
      // Use new unified navigation function
      navigateToBlock(pageId, blockId);
    } else {
      // Fallback to original implementation (for Studio context)
      changePageById?.(pageId);
      const blockDetails = getBlockFromBlockId?.(blockId);
      hightBlock?.(blockId);
    }
  };

  return (
    <div style={{ padding: "0.5rem" }}>
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper", p: 0 }}
        component="div"
      >
        {tabObjects?.map((item, idx) => (
          <div key={item._id || idx}>
            <ListItemButton onClick={() => handleClick(idx)} sx={{ p: 0 }}>
              <ListItemIcon sx={{ minWidth: 0 }}>
                {open[idx] ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
              <ListItemText
                primary={item.term}
                sx={{ fontWeight: "bold", "& > span": { fontWeight: "bold" } }}
              />
              <span className={styles["up-down"]}>
                <IconButton onClick={(e) => onClickUp(e, item?.references)}>
                  <NorthIcon />
                </IconButton>
                <IconButton onClick={(e) => onClickDown(e, item?.references)}>
                  <SouthIcon />
                </IconButton>
              </span>
            </ListItemButton>
            <Collapse in={open[idx]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Box sx={{ pl: 1, mb: 1 }}>
                  <div>{item.definition}</div>
                </Box>
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </div>
  );
};

export default GlossaryAndKeywords;
