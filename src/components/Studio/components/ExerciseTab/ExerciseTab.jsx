import React, { useState, useEffect } from "react";
import { Box, List, ListItemButton, ListItemText, CircularProgress, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { getExercises } from "../../../../services/api";
import ExercisePlayerModal from "./ExercisePlayerModal";

const ExerciseTab = ({ chapterId }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      if (!chapterId) return;
      setLoading(true);
      const data = await getExercises(chapterId);
      setExercises(data || []);
      setLoading(false);
    };
    fetch();
  }, [chapterId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress size={24} /></Box>;
  }

  if (!exercises.length) {
    return <Box p={2}><Typography color="textSecondary">No exercises found.</Typography></Box>;
  }

  return (
    <Box>
      <List>
        {exercises.map((ex, idx) => (
          <ListItemButton key={idx} onClick={() => setSelectedExercise(ex)}>
            <PlayArrowIcon sx={{ mr: 1 }} fontSize="small" />
            <ListItemText primary={ex.name} />
          </ListItemButton>
        ))}
      </List>
      <ExercisePlayerModal
        show={!!selectedExercise}
        onHide={() => setSelectedExercise(null)}
        exercise={selectedExercise}
      />
    </Box>
  );
};

export default ExerciseTab;
