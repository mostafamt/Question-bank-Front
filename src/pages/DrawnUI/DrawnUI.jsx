import React from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios";
import Alert from "@mui/material/Alert";
import { Box, Button, TextField } from "@mui/material";
import Image from "../../components/Image/Image";
import Video from "../../components/Video/Video";
import Sound from "../../components/Sound/Sound";

const ap = {
  question: "text",
  image: "image",
  video: "video",
  voice: "voice",
  array: [
    {
      item: "text",
      option: "text",
    },
  ],
};

const DrawnUI = () => {
  const params = useParams();
  const { type } = params;
  const [foundParameters, setFoundParameters] = React.useState(true);
  const [parameters, setParameters] = React.useState();
  const [count, setCount] = React.useState(2);

  const getParameters = async () => {
    const res = await axios.get("interactive-object-types");
    const objects = res.data;
    const selectedType = ap;
    // const selectedType = objects.find(
    //   (item) => item.typeName === type
    // )?.abstractParameter;
    setParameters(selectedType);
    setFoundParameters(Boolean(selectedType));
  };

  React.useEffect(() => {
    getParameters();
  }, []);

  const onChangeArray = (field, add_Remove = true) => {
    let newObject = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (key === field) {
        let newValue = value;
        if (add_Remove) {
          let item = value.length > 0 ? value[0] : "";
          newValue = [...value, item];
        } else {
          if (value.length > 1) {
            value.pop();
          }
          newValue = value;
        }

        newObject = { ...newObject, [key]: newValue };
      } else {
        newObject = { ...newObject, [key]: value };
      }
    }
    console.log("newObject= ", newObject);
    setParameters(newObject);
  };

  const onClickRemove = (field) => {};

  const parseParameters = (parameters, space = 4) => {
    let jsx = "";
    for (const [key, value] of Object.entries(parameters)) {
      let item = "";

      if (value === "text") {
        item = (
          <Box sx={{ mb: space }}>
            <TextField
              label={key.replaceAll("_", "").toUpperCase()}
              variant="outlined"
              fullWidth
            />
          </Box>
        );
      } else if (value === "image") {
        item = <Image space={space} />;
      } else if (value === "video") {
        item = <Video space={space} />;
      } else if (value === "voice") {
        item = <Sound space={space} />;
      } else if (Array.isArray(value)) {
        item = value.map((itm) => parseParameters(itm, 2));
        item = (
          <>
            {item}
            <div>
              <Button onClick={() => onChangeArray(key, true)}>add</Button>
              <Button onClick={() => onChangeArray(key, false)}>remove</Button>
            </div>
          </>
        );
      }
      jsx = (
        <React.Fragment>
          {jsx}
          {item}
        </React.Fragment>
      );
    }
    return jsx;
  };

  if (!foundParameters) {
    return (
      <div className="container">
        <Alert severity="error">Abstract Parameters is missing!</Alert>
      </div>
    );
  }

  console.log("parameters= ", parameters);

  return (
    <div className="container">
      <h1>{type}</h1>
      <form style={{ marginBottom: "2rem" }}>
        {parameters && parseParameters(parameters)}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button type="submit" variant="contained" sx={{ mt: 4 }}>
            Submit
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default DrawnUI;
