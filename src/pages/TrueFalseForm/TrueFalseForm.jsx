import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React from "react";

import styles from "./trueFalseForm.module.scss";

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  option: {
    // position: "relative",
    width: "90%",
  },
  btn: {
    display: "flex",
    gap: ".5rem",
  },
  deleteBtn: {},
  box: {
    marginTop: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
};

const TrueFalseForm = () => {
  const [questions, setQuestions] = React.useState([
    {
      title: "",
    },
  ]);

  return (
    <>
      <Box
        sx={{
          height: "200px",
          width: "100%",
          my: 2,
          overflow: "hidden",
        }}
      >
        <img
          src="/assets/question-bg-1.jpg"
          alt="question background"
          style={{
            postion: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }}
        />
      </Box>
      <TextField
        label="Question"
        variant="outlined"
        name="title"
        sx={styleSheet.objectName}
        value={questions[0].title}
        // onChange={(e) =>
        //   handleEditQuestionParam(question.id, e.target.name, e.target.value)
        // }
      />
      <div className={styles.option}>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="isCorrect"
            row
            // value={question.params.isCorrect}
            // onChange={(e) =>
            //   handleEditQuestionParam(
            //     question.id,
            //     e.target.name,
            //     e.target.value === "true"
            //   )
            // }
          >
            <FormControlLabel value={true} control={<Radio />} label="True" />
            <FormControlLabel value={false} control={<Radio />} label="False" />
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};

export default TrueFalseForm;
