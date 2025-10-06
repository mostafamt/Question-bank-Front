import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import styles from "./table.module.scss";
import { Button, IconButton, Radio } from "@mui/material";
import { RadioButtonCheckedRounded, Delete } from "@mui/icons-material";
import axios from "../../axios";
import { fetchObjects } from "../../services/api";
import { v4 as uuidv4 } from "uuid";

export default function DataTable(props) {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState();
  const [searchValue, setSearchValue] = React.useState("")
  const [searchColumn, setSearchColumn] = React.useState("")
  const [paginationModel, setPaginationModel] = React.useState({
    page: 1,
    pageSize: 10,
  });
  const columnNames = { name: "questionName", type: "type", domain: "domainName", subDomain: "subDomainName", topic: "topic", IR: "IR" }

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
      sortable: false,
      filterable: false,
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
      field: "topic",
      headerName: "Topic",
      width: 100,
    },
    {
      field: "IR",
      headerName: "Instructional Role",
      width: 150,
    },
    {
      field: "dateModified",
      headerName: "Date Modified",
      width: 120,
    },
    {
      field: "hasAnswered",
      headerName: "Has Answered",
      width: 120,
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
      paginationModel.pageSize,
      searchValue,
      searchColumn
    );
    const data = res?.data;
    if (!!data?.docs.length) {
      setRows(
        data.docs.map((item, idx) => ({
          id: item._id || uuidv4(),
          name:
            item.questionName ||
            `Untitled ${paginationModel.page * paginationModel.pageSize + idx + 1
            }`,
          type: item.type,
          domain: item.domainName,
          subDomain: item.subDomainName,
          topic: item.topic,
          IR: item.IR,
          dateModified: new Date(item.createdAt).toLocaleDateString("en-GB"),
          hasAnswered: item.isAnswered,
        }))
      );
    }
    setLoading(false);
    setTotal(res.data.totalDocs);
  }, [paginationModel.page, paginationModel.pageSize, searchValue, searchColumn]);

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
      <div className={styles.table}>
        <div className={styles.actions}>
          <Button variant="contained" onClick={onClickAddQuestion}>
            New Object
          </Button>
          <Button variant="contained" onClick={onClickEditQuestion}>
            Edit Object
          </Button>
        </div>
        <DataGrid
          rows={rows}
          rowCount={total}
          loading={loading}
          autoHeight
          columns={columns}
          baseCheckbox={RadioButtonCheckedRounded}
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={paginationModel}
          paginationMode="server"
          onFilterModelChange={(e) => {
            console.log(e.items.length)
            if (e.items.length && e.items[0].value) {
              const searchValue = e.items[0].value
              setSearchValue(searchValue)
              let propName = columnNames[e.items[0].field]
              console.log(propName)
              setSearchColumn(propName)
              // this.getData(1, this.state.rowsPerPage, `&${propName}=${searchValue}`)
              // //axios.get(`${urls.lomURL}/los?${propName}=${searchValue}`)
            } else {
              setSearchValue("")
              setSearchColumn("")
            }

          }}
          onPaginationModelChange={setPaginationModel}
        />
      </div>
    </>
  );
}
