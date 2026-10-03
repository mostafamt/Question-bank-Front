import React from "react";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useStore } from "../../../store/store";
import useReaderEnriching from "../../Studio/hooks/useReaderEnriching";
import { READER_VBLOCK_CONTENT_TYPES } from "../../Studio/constants";
import { deriveEnrichingContentName } from "../List/enrichingContent.utils";

import listItemStyles from "../ListItem/listItem.module.scss";
import styles from "./readerEnrichingItems.module.scss";

/**
 * "My items" section of the Enriching Content tab in reader mode.
 * The reader's own text/link items, stored in the browser (never submitted).
 *
 * @param {Object} props
 * @param {string} props.chapterId - Current chapter ID
 */
const ReaderEnrichingItems = ({ chapterId }) => {
  const { openModal } = useStore();
  const { items, addItem, updateItem, removeItem } =
    useReaderEnriching(chapterId);

  const [pendingDelete, setPendingDelete] = React.useState(null);

  const onClickAdd = () => {
    openModal("enriching-content", {
      allowedTypes: READER_VBLOCK_CONTENT_TYPES,
      onConfirm: addItem,
    });
  };

  const onClickEdit = (item) => {
    openModal("enriching-content", {
      title: "Edit Enriching Content Item",
      allowedTypes: READER_VBLOCK_CONTENT_TYPES,
      editingContent: item,
      onConfirm: (updated) => updateItem(item.id, updated),
    });
  };

  const onClickPlay = (item) => {
    if (item.type === "text") {
      openModal("text-editor", { value: item.contentValue, onClickSubmit: null });
    } else if (item.type === "link") {
      openModal("iframe-display", { url: item.contentValue });
    }
  };

  const onConfirmDelete = () => {
    removeItem(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <section className={styles["reader-enriching"]} aria-label="My items">
      <div className={styles.header}>
        <h6 className={styles.title}>My items</h6>
        <Tooltip title="Add your own item">
          <IconButton onClick={onClickAdd} color="primary" aria-label="add my item">
            <AddIcon color="primary" />
          </IconButton>
        </Tooltip>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>No items yet. Tap + to add one.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id} className={listItemStyles["list-item"]}>
              <span>
                <PersonIcon
                  className={styles.mine}
                  fontSize="small"
                  color="primary"
                  aria-label="your item"
                />
                {deriveEnrichingContentName(item.type, item.contentValue)}
              </span>
              <span>
                <IconButton onClick={() => onClickPlay(item)} aria-label="play">
                  <PlayArrowIcon />
                </IconButton>
              </span>
              <span>
                <IconButton onClick={() => onClickEdit(item)} aria-label="edit">
                  <EditIcon />
                </IconButton>
              </span>
              <span>
                <IconButton onClick={() => setPendingDelete(item)} aria-label="delete">
                  <DeleteIcon color="error" />
                </IconButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        aria-labelledby="delete-reader-enriching-title"
      >
        <DialogTitle id="delete-reader-enriching-title">
          Delete this item?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete &&
              `"${deriveEnrichingContentName(
                pendingDelete.type,
                pendingDelete.contentValue
              )}" will be removed. This can't be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" onClick={onConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default ReaderEnrichingItems;
