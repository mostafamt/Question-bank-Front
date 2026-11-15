import * as React from "react";
import {
  DataGrid,
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./table.module.scss";
import { Button, IconButton, MenuItem, Radio } from "@mui/material";
import { RadioButtonCheckedRounded, Delete } from "@mui/icons-material";
import axios from "../../axios";
import { fetchObjects, getObject } from "../../services/api";
import { v4 as uuidv4 } from "uuid";

// author may be a populated user ({ username }) or a plain string
const getAuthorName = (author) =>
  (typeof author === "string" ? author : author?.username) || "—";

const downloadJson = (data, fileName) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

// The default GridToolbar, plus "Object JSON" / "Object Parameters" in its
// Export menu for the selected row
const TableToolbar = ({ onExport, canExport }) => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExportContainer>
      <GridCsvExportMenuItem />
      <GridPrintExportMenuItem />
      <JsonExportMenuItem what="object" onExport={onExport} disabled={!canExport}>
        Download object JSON
      </JsonExportMenuItem>
      <JsonExportMenuItem what="parameters" onExport={onExport} disabled={!canExport}>
        Download object parameters
      </JsonExportMenuItem>
    </GridToolbarExportContainer>
  </GridToolbarContainer>
);

// The export container passes hideMenu to its items so they can close it
const JsonExportMenuItem = ({ hideMenu, what, onExport, disabled, children }) => (
  <MenuItem
    disabled={disabled}
    onClick={() => {
      hideMenu?.();
      onExport(what);
    }}
  >
    {children}
  </MenuItem>
);

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DataTable(props) {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState();
  const [searchValue, setSearchValue] = React.useState("")
  const [searchColumn, setSearchColumn] = React.useState("")
  // Page lives in the URL (?page=&pageSize=) so leaving the page and coming
  // back, or reloading, keeps the same page. URL page is 1-based, grid is 0-based.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = Number(searchParams.get("page"));
  const urlPageSize = Number(searchParams.get("pageSize"));
  const paginationModel = React.useMemo(
    () => ({
      page: Number.isInteger(urlPage) && urlPage > 0 ? urlPage - 1 : 0,
      pageSize: PAGE_SIZE_OPTIONS.includes(urlPageSize) ? urlPageSize : 10,
    }),
    [urlPage, urlPageSize]
  );
  const setPaginationModel = (model) => {
    setSearchParams(
      (params) => {
        params.set("page", model.page + 1);
        params.set("pageSize", model.pageSize);
        return params;
      },
      { replace: true }
    );
  };
  const columnNames = { name: "questionName", category: "category", type: "type", domain: "domainName", subDomain: "subDomainName", topic: "topic", IR: "IR", author: "author" }

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
      field: "category",
      headerName: "Category",
      width: 150,
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
      field: "author",
      headerName: "Author",
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
      paginationModel.page + 1,
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
          category: item.category,
          type: item.type,
          domain: item.domainName,
          subDomain: item.subDomainName,
          topic: item.topic,
          IR: item.IR,
          author: getAuthorName(item.author),
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

  // what: "object" downloads the whole object, "parameters" only its parameters
  const onExport = async (what) => {
    const object = await getObject(selectedRowId);
    if (!object) return;
    const name = object.questionName || selectedRowId;
    if (what === "parameters") {
      downloadJson(object.parameters ?? {}, `${name}-parameters.json`);
    } else {
      downloadJson(object, `${name}.json`);
    }
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
          slots={{ toolbar: TableToolbar }}
          slotProps={{
            toolbar: { onExport, canExport: Boolean(selectedRowId) },
          }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
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
