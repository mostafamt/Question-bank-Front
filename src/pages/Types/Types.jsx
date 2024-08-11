import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import axios from "../../axios";
import { Add } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader1 from "../../components/Loader1/Loader1";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { syntaxHighlight } from "../../utils/data";
import Modal from "../../components/Modal/Modal";
import DeleteModalContent from "../../components/Modal/DeleteModalContent/DeleteModalContent";

import styles from "./types.module.scss";
import { getQuestionTypes } from "../../services/api";

const Types = () => {
  const [types, setTypes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [activeId, setActiveID] = React.useState("");
  const navigate = useNavigate();

  const getData = async () => {
    try {
      const res = await getQuestionTypes();
      const data = res.data;
      setTypes(data);
      setLoading(false);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  const onClickEdit = (event, id) => {
    event.stopPropagation();
    setActiveID(id);
    navigate(`/edit-type/${id}`);
  };

  const onClickDelete = (event, id) => {
    event.stopPropagation();
    setActiveID(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => setShowDeleteModal(false);

  const onConfirmDelete = async () => {
    const res = await axios.delete(`/io-types/${activeId}`);
    handleCloseModal();
    toast.success(res.data);
    getData();
  };

  return (
    <>
      <Modal show={showDeleteModal} handleClose={handleCloseModal}>
        <DeleteModalContent
          handleClose={handleCloseModal}
          name="Type"
          onDelete={onConfirmDelete}
        />
      </Modal>
      <div className="container mb-4">
        <h1 className="mb-4 text-center">Types</h1>
        <Button
          variant="contained"
          endIcon={<Add />}
          className="mb-4"
          component={Link}
          to="/add-type"
        >
          Add a new type
        </Button>
        {loading ? (
          <Loader1 text="Loading" />
        ) : (
          types.map((type) => (
            <Accordion key={type?._id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div className={styles.line}>
                  <div>{type?.typeName}</div>
                  <div className={styles.actions}>
                    <IconButton
                      aria-label="edit"
                      onClick={(event) => onClickEdit(event, type._id)}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      onClick={(event) => onClickDelete(event, type._id)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails>
                <pre
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(JSON.stringify(type, undefined, 4)),
                  }}
                />
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>
    </>
  );
};

export default Types;
