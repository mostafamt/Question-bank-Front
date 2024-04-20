import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import styles from "./test.module.scss";

const ui = [
  {
    element: "image",
    path: "/assets/cats.jpg",
    alt: "alt ",
  },
  {
    element: "input",
    label: "question",
  },
  {
    element: "textarea",
    label: "description",
  },
  {
    element: "button",
    label: "ok",
  },
];

const Test = () => {
  const constructUI = (ui) => {
    const drawnUI = ui.map((item) => {
      let unit = "";
      if (item.element === "input") {
        unit = (
          <div class="mb-2">
            <TextField label={item.label} variant="outlined" />
          </div>
        );
      } else if (item.element === "textarea") {
        unit = (
          <div class="mb-2">
            <TextField
              id="outlined-textarea"
              label={item.label}
              placeholder=""
              multiline
              rows={4}
            />
          </div>
        );
      } else if (item.element === "button") {
        unit = (
          <div class="mb-2">
            <Button variant="contained">{item.label}</Button>
          </div>
        );
      } else if (item.element === "image") {
        unit = (
          <div class="mb-2">
            <img src={item.path} alt={item.alt} width="200" />
          </div>
        );
      }
      return unit;
    });

    return drawnUI;
  };

  return (
    <>
      <h1>Hello world</h1>
      {constructUI(ui)}
    </>
  );
};

export default Test;
