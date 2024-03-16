import React from "react";
import axios from "../../axios";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

const EnhancedTable = () => {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);

  const fetchQuestions = React.useCallback(async () => {
    setLoading(true);
    const res = await axios.get(`/interactive-objects?page=1`);
    const data = res.data;
    if (!!data.docs.length) {
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
  }, []);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div style={{ flex: "0 0 57%" }}>Name</div>
        <div style={{ flex: "0 0 20%" }}>Type</div>
      </div>
      <FormGroup>
        {rows.map((item) => (
          <FormControlLabel
            control={<Checkbox />}
            label={
              <div style={{ display: "flex", gap: "2rem", width: "22rem" }}>
                <div style={{ flex: "0 0 70%" }}>{item.name}</div>
                <div style={{ flex: "0 0 20%" }}>{item.type}</div>
              </div>
            }
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default EnhancedTable;
