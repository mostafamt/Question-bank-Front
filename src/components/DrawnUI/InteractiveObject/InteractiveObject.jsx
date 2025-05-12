import React from "react";

import styles from "./interactiveObject.module.scss";
import { Controller } from "react-hook-form";
import { Box, Button, TextField } from "@mui/material";
import { fullTextTrim } from "../../../utils/data";
import { Link } from "react-router-dom";
import Modal from "../../Modal/Modal";
import SelectObjectModal from "../../Modal/SelectObjectModal/SelectObjectModal";
import ObjectRenderer from "../../ObjectRenderer/ObjectRenderer";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const InteractiveObject = (props) => {
  const {
    space,
    label,
    name,
    errors,
    type,
    path,
    required,
    control,
    setValue,
  } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState("");

  const onClickSelectFromLibrary = () => {
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  const onClickSelect = () => {
    setValue(name, selectedRowId);
    onCloseModal();
  };

  const onClickCancel = () => {
    onCloseModal();
  };

  const newLabel = fullTextTrim(label);

  return (
    <>
      <Modal show={showModal} handleClose={onCloseModal} size="xl">
        <SelectObjectModal
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
          onClickSelect={onClickSelect}
          onClickCancel={onClickCancel}
        />
      </Modal>
      <div className={styles["interactive-object"]}>
        <Controller
          name={name}
          control={control}
          rules={{ required }}
          defaultValue="" // Set default value if needed
          render={({ field }) => (
            <Box>
              <Box>
                <Box className={styles.header}>
                  <Box>
                    <Link
                      to="/add-question"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="text">Add object</Button>
                    </Link>

                    <Button variant="text" onClick={onClickSelectFromLibrary}>
                      Select From Library
                    </Button>
                  </Box>

                  {field.value && (
                    <Link
                      to={`/show/${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        sx={{
                          textTransform: "none",
                          outlined: "none",
                          border: "none",
                        }}
                      >
                        <span>Open in new tab</span>
                        <OpenInNewIcon />
                      </Button>
                    </Link>
                  )}
                </Box>
                <TextField
                  {...field}
                  label={newLabel}
                  type={type}
                  fullWidth
                  hidden
                />
              </Box>
              {field.value && <ObjectRenderer id={field.value} />}
            </Box>
          )}
        />
      </div>
    </>
  );
};

export default InteractiveObject;
