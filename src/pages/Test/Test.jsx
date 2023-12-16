import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Radio } from "@mui/material";
import axios from "../../axios";
// import { useDemoData } from "@mui/x-data-grid-generator";

const Test = () => {
  const [image, setImage] = React.useState("");

  const onChange = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append("filename", file);
    const res = await axios.post("/upload", data);
    setImage(res.data);
    console.log(res.data);
  };

  return (
    <div>
      {image && (
        <div>
          <img src={image} alt={image} height="200" />{" "}
        </div>
      )}
      <input type="file" name="file" id="file" onChange={onChange} />
    </div>
  );
};

export default Test;
