import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, Radio } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { RadioButtonCheckedRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "../../../api/bookapi";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";

import styles from "./booksTable.module.scss";

const BooksTable = () => {
  const [selectedRowId, setSelectedRowId] = React.useState();
  const [paginationModel, setPaginationModel] = React.useState({
    page: 1,
    pageSize: 5,
  });

  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });
  const navigate = useNavigate();

  const newData = data?.map((item) => ({ ...item, id: item._id })) || [];

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
      field: "title",
      headerName: "Title",
      width: 300,
      renderCell: (params) => {
        return <Link to={`/show/${params.id}`}>{params.row.title}</Link>;
      },
    },
  ];

  const onClickAddQuestion = () => {
    navigate("/add-book");
  };

  const onClickEditQuestion = () => {
    navigate(`/edit/${selectedRowId}`);
  };

  return (
    <div className={styles["books-table"]}>
      <div className={styles.title}>
        <ImportContactsIcon />
        <h3>Books</h3>
      </div>
      <div className={styles.actions}>
        <Button variant="contained" onClick={onClickAddQuestion}>
          Add Book
        </Button>
        <Button variant="contained" onClick={onClickEditQuestion}>
          Edit
        </Button>
      </div>
      <DataGrid
        rows={newData}
        loading={isLoading}
        autoHeight
        columns={columns}
        baseCheckbox={RadioButtonCheckedRounded}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[5, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </div>
  );
};

export default BooksTable;
