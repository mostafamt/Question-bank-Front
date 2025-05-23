import { Radio } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchObjects } from "../../services/api";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { v4 as uuidv4 } from "uuid";
import { RadioButtonCheckedRounded } from "@mui/icons-material";

import styles from "./objectsTable.module.scss";

const ObjectsTable = (props) => {
  const { selectedRowId, setSelectedRowId } = props;
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 1,
    pageSize: 5,
  });

  const renderColorStatus = (status) => {
    let color = { backgroundColor: "black" };
    if (status === "g") {
      color = { backgroundColor: "green" };
    } else if (status === "y") {
      color = { backgroundColor: "yellow" };
    } else if (status === "r") {
      color = { backgroundColor: "red" };
    }
    return color;
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
      width: 300,
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
      renderCell: (params) => {
        return (
          <div
            className={styles["circular-status"]}
            style={renderColorStatus(params.row.hasAnswered)}
          ></div>
        );
      },
    },
  ];

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchObjects(
      paginationModel.page,
      paginationModel.pageSize
    );
    const data = res?.data;
    if (!!data?.docs.length) {
      setRows(
        data.docs.map((item, idx) => ({
          id: item._id || uuidv4(),
          name:
            item.questionName ||
            `Untitled ${
              paginationModel.page * paginationModel.pageSize + idx + 1
            }`,
          type: item.type,
          domain: item.domainName,
          subDomain: item.subDomainName,
          dateModified: new Date(item.createdAt).toLocaleDateString("en-GB"),
          hasAnswered: item.isAnswered,
        }))
      );
    }
    setLoading(false);
    setTotal(res.data.totalDocs);
  }, [paginationModel.page, paginationModel.pageSize]);

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
    <div>
      <DataGrid
        rows={rows}
        rowCount={total}
        loading={loading}
        autoHeight
        columns={columns}
        baseCheckbox={RadioButtonCheckedRounded}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[5, 10]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
      />
    </div>
  );
};

export default ObjectsTable;
