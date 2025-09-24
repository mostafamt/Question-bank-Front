import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { Button, Checkbox, Radio } from "@mui/material";
import { RadioButtonCheckedRounded, Delete } from "@mui/icons-material";
import { fetchObjects } from "../../../services/api";
import CategoryIcon from "@mui/icons-material/Category";

import styles from "./questionsTable.module.scss";

const QuestionsTable = (props) => {
  const { objects, setObjects } = props;

  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState();
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

  const handleChange = (params) => {
    const found = objects.some((item) => item.id === params.id);
    if (found) {
      setObjects((prevState) =>
        prevState.filter((item) => item.id !== params.id)
      );
    } else {
      setObjects((prevState) => [...prevState, params.row]);
    }
  };

  const isChecked = (params) => {
    return objects?.some((item) => item.id === params.id);
  };

  const columns = [
    {
      field: "col0",
      headerName: "",
      width: 70,
      renderCell: (params) => (
        <Checkbox
          checked={isChecked(params)}
          onChange={() => handleChange(params)}
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
        data.docs.map((item) => ({
          id: item._id,
          name: item.questionName,
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

  return (
    <>
      <div className={styles.table}>
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
    </>
  );
};

export default QuestionsTable;
