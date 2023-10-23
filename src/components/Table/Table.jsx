import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { BACKEND_URL } from "../../config/config";
import { Link, useNavigate } from "react-router-dom";
import styles from "./table.module.scss";
import { Button } from "@mui/material";
import {
  RadioButtonChecked,
  RadioButtonCheckedRounded,
} from "@mui/icons-material";

const columns = [
  {
    field: "name",
    headerName: "Title",
    width: 200,
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
    width: 200,
  },
  {
    field: "hasAnswered",
    headerName: "Has Answered",
    width: 200,
  },
];

export default function DataTable() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/list`);
    const data = await res.json();
    if (!!data.length) {
      setRows(
        data.map((item) => ({
          id: item._id,
          name: item.name,
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

  const onRowClick = (id) => {
    navigate(`/show/${id}`);
  };

  return (
    <div className={styles.table}>
      <div className={styles.actions}>
        <Link to="/add-question">
          <Button variant="contained">Add Question</Button>
        </Link>

        <Link to="/edit-question">
          <Button variant="contained">Edit</Button>
        </Link>
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
        onRowClick={({ id }) => onRowClick(id)}
        // checkboxSelection
        baseCheckbox={RadioButtonCheckedRounded}
      />
    </div>
  );
}
