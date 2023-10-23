import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import MultipleChoiceForm from "../../QuestionForms/MultipleChoiceForm/MultipleChoiceForm";
import TrueFalseForm from "../../QuestionForms/TrueFalseForm/TrueFalseForm";
import { grey } from "@mui/material/colors";
import FillInTheBlank from "../../QuestionForms/FillInTheBlank/FillInTheBlank";

const types = [
  { id: uuidv4(), value: "multipleChoice", label: "Multiple Choice" },
  { id: uuidv4(), value: "trueFalse", label: "True / False" },
  { id: uuidv4(), value: "fillInTheBlank", label: "Fill in the blank" },
];

const QuestionForm = (props) => {
  const {
    questions,
    handleOpenQuestion,
    handleChangeType,
    handleAddQuestion,
    handleDeleteQuestion,
    handleEditQuestionParam,
  } = props;

  return (
    <>
      <List
        sx={{ width: "100%", bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        {questions.map((question, idx) => (
          <Box key={question.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <ListItemButton
                onClick={() => handleOpenQuestion(question.id)}
                sx={
                  question.open
                    ? { backgroundColor: grey[300] }
                    : { backgroundColor: grey[200] }
                }
              >
                <ListItemText primary={`Question ${idx + 1}`} />
                {question.open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <IconButton
                aria-label="delete"
                sx={{ width: "3rem", height: "3rem" }}
                color="error"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
            <Collapse
              in={question.open}
              timeout="auto"
              unmountOnExit
              sx={{
                border: `1px solid ${grey[300]}`,
                borderTop: 0,
                mb: 2,
                p: 2,
                borderRadius: "0 0 .5rem .5rem",
                width: "95%",
              }}
            >
              <Box>
                <FormControl sx={{ width: 240, my: 2 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={question.type}
                    onChange={(e) =>
                      handleChangeType(question.id, e.target.value)
                    }
                  >
                    {types.map((type) => (
                      <MenuItem key={type.id} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {question.type === "multipleChoice" && (
                  <MultipleChoiceForm
                    question={question}
                    handleEditQuestionParam={handleEditQuestionParam}
                  />
                )}
                {question.type === "trueFalse" && (
                  <TrueFalseForm
                    question={question}
                    handleEditQuestionParam={handleEditQuestionParam}
                  />
                )}
                {question.type === "fillInTheBlank" && (
                  <FillInTheBlank question={question} />
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
      <Button sx={{ fontWeight: "bold" }} onClick={handleAddQuestion}>
        Add Question
      </Button>
    </>
  );
};

export default QuestionForm;
