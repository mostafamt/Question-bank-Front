import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Box, Button, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const ExercisePlayerModal = ({ show, onHide, exercise }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = exercise?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  if (!exercise) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{exercise.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0, height: "70vh" }}>
        <Box display="flex" height="100%">
          <Box width={200} borderRight="1px solid #ddd" overflow="auto">
            <List dense>
              {questions.map((q, idx) => (
                <ListItemButton
                  key={q._id}
                  selected={idx === currentIndex}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <ListItemText
                    primary={`${idx + 1}. ${q.name}`}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: 13,
                      fontWeight: idx === currentIndex ? "bold" : "normal",
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
          <Box flex={1} display="flex" flexDirection="column">
            <Box flex={1}>
              {currentQuestion?.url ? (
                <iframe
                  src={currentQuestion.url}
                  title={currentQuestion.name}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="textSecondary">No content available</Typography>
                </Box>
              )}
            </Box>
            <Box display="flex" justifyContent="center" gap={2} p={2} borderTop="1px solid #ddd">
              <Button variant="outlined" startIcon={<NavigateBeforeIcon />} onClick={handlePrev} disabled={currentIndex === 0}>
                Previous
              </Button>
              <Typography alignSelf="center">
                {currentIndex + 1} / {questions.length}
              </Typography>
              <Button variant="outlined" endIcon={<NavigateNextIcon />} onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                Next
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal.Body>
    </Modal>
  );
};

export default ExercisePlayerModal;
