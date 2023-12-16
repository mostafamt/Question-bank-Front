import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import styles from "./table.module.scss";
import { Button, IconButton, Radio } from "@mui/material";
import { RadioButtonCheckedRounded, Delete } from "@mui/icons-material";
import Modal from "../Modal/Modal";
import DeleteModalContent from "../Modal/DeleteModalContent/DeleteModalContent";
import axios from "../../axios";
import { toast } from "react-toastify";

export default function DataTable(props) {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState();
  const [showModal, setShowModal] = React.useState(false);
  const [activeQuestion, setActiveQuestion] = React.useState();

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onDeleteQuestion = (id) => {
    openModal();
    setActiveQuestion(id);
  };

  const onConfirmDelete = async () => {
    closeModal();
    try {
      const res = await axios.delete(`/question/${activeQuestion}`);
      console.log(res.data);
      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      field: "col0",
      headerName: "",
      width: 70,
      renderCell: (params) => (
        <Radio
          checked={params.id == selectedRowId}
          value={params.id}
          onChange={(e) => {
            console.log(e.target.value);
            setSelectedRowId(e.target.value);
          }}
        />
      ),
    },
    {
      field: "name",
      headerName: "Title",
      width: 200,
      renderCell: (params) => {
        return <Link to={`/show/${params.id}`}>{params.row.name}</Link>;
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
    },
    {
      field: "domain",
      headerName: "Domain",
      width: 200,
    },
    {
      field: "subDomain",
      headerName: "Sub Domain",
      width: 200,
    },
    {
      field: "dateModified",
      headerName: "Date Modified",
      width: 150,
    },
    {
      field: "hasAnswered",
      headerName: "Has Answered",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => {
        return (
          <IconButton
            aria-label="delete"
            color="error"
            onClick={() => onDeleteQuestion(params.id)}
          >
            <Delete />
          </IconButton>
        );
      },
    },
  ];

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    const res = await axios.get(`/interactive-objects`);
    const data = res.data;
    if (!!data.docs.length) {
      setRows(
        data.docs.map((item) => ({
          id: item._id,
          name: item.questionName,
          type: item.type,
          domain: "Scube Test Domain",
          subDomain: "Scube Test Sub Domain",
          dateModified: new Date(item.createdAt).toLocaleDateString("en-GB"),
          hasAnswered: "True",
        }))
      );
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const onClickAddQuestion = () => {
    navigate("/add-question");
  };

  const onClickEditQuestion = () => {
    navigate(`/edit/${selectedRowId}`);
  };

  return (
    <>
      <Modal show={showModal} handleClose={closeModal}>
        <DeleteModalContent
          handleClose={closeModal}
          onDelete={onConfirmDelete}
        />
      </Modal>
      <div className={styles.table}>
        <div className={styles.actions}>
          <Button variant="contained" onClick={onClickAddQuestion}>
            Add Question
          </Button>
          <Button variant="contained" onClick={onClickEditQuestion}>
            Edit
          </Button>
        </div>
        <DataGrid
          loading={loading}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          baseCheckbox={RadioButtonCheckedRounded}
          slots={{ toolbar: GridToolbar }}
        />
      </div>
    </>
  );
}
