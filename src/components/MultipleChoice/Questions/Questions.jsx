import React from "react";
import { Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";

import TreeItem from "@mui/lab/TreeItem";

import { TreeView } from "@mui/lab";
import QuestionForm from "../QuestionForm/QuestionForm";

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
  box: {
    marginTop: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const Questions = (props) => {
  const {
    questions,
    onAddQuestion,
    updateQuestionTitle,
    addOption,
    updateOption,
    deleteOption,
  } = props;
  return (
    <div>
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {questions.map((question, idx) => (
          <TreeItem
            key={question.id}
            nodeId={question.id}
            label={`question ${idx + 1}`}
            sx={styleSheet.treeItem}
          >
            <QuestionForm
              question={question}
              updateQuestionTitle={updateQuestionTitle}
              addOption={addOption}
              updateOption={updateOption}
              deleteOption={deleteOption}
            />
          </TreeItem>
        ))}
        <Button
          variant="contained"
          color="secondary"
          sx={styleSheet.button}
          onClick={onAddQuestion}
        >
          <AddIcon />
          Add question
        </Button>
      </TreeView>
    </div>
  );
};

export default Questions;
