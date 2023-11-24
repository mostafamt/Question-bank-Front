import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Radio } from "@mui/material";
// import { useDemoData } from "@mui/x-data-grid-generator";

const VISIBLE_FIELDS = ["name", "rating", "country", "dateCreated", "isAdmin"];

const rows = [
  { id: 1, col1: "Hello", col2: "World" },
  { id: 2, col1: "DataGridPro", col2: "is Awesome" },
  { id: 3, col1: "MUI", col2: "is Amazing" },
];

const Test = () => {
  const [selectedRowId, setSelectedRowId] = React.useState(1);

  const columns = [
    {
      field: "col0",
      headerName: "Column 0",
      width: 150,
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
    { field: "col1", headerName: "Column 1", width: 150 },
    { field: "col2", headerName: "Column 2", width: 150 },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
      />
    </div>
  );
};

export default Test;
