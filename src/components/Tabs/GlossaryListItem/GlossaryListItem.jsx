import React from "react";
import { Box } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const GlossaryListItem = (props) => {
  const { item, handleClick, idx, open } = props;
  return (
    <div>
      <ListItemButton onClick={() => handleClick(idx)} sx={{ p: 0 }}>
        <ListItemIcon sx={{ minWidth: 0 }}>
          {open[idx] ? <ExpandLess /> : <ExpandMore />}
        </ListItemIcon>
        <ListItemText
          primary={item.term}
          sx={{ fontWeight: "bold", "& > span": { fontWeight: "bold" } }}
        />
      </ListItemButton>
      <Collapse in={open[idx]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box sx={{ pl: 1, mb: 1 }}>
            <div>{item.definition}</div>
          </Box>
        </List>
      </Collapse>
    </div>
  );
};

export default GlossaryListItem;
