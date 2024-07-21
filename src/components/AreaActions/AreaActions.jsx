import React from "react";
import AreaAction from "../AreaAction/AreaAction";
import { Button, CircularProgress, IconButton, TextField } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import MuiSelect from "../MuiSelect/MuiSelect";
import { reorder } from "../../utils/ocr";

const items = [
  {
    id: "item-1",
    content: "Item 1",
  },
  {
    id: "item-2",
    content: "Item 2",
  },
  {
    id: "item-3",
    content: "Item 3",
  },
  {
    id: "item-4",
    content: "Item 4",
  },
  {
    id: "item-5",
    content: "Item 5",
  },
];

const AreaActions = (props) => {
  const {
    parameters,
    onChangeParameter,
    loading,
    results,
    setResults,
    onEditText,
    onClickDeleteArea,
    type,
    onClickSubmit,
    loadingSubmit,
    areas,
    setAreas,
    trialAreas,
  } = props;

  console.log("areas= ", areas);

  const onDragEnd = (result) => {
    console.log("result= ", result);
    if (!result.destination) {
      return;
    }

    const newAreas = reorder(
      areas,
      result.source.index,
      result.destination.index
    );

    setAreas(newAreas);
    console.log("newAreas= ", newAreas);
    // setList([...newItems]);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-id">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {areas.map((area, idx) => (
                <Draggable key={idx} draggableId={String(area.y)} index={idx}>
                  {(provided, snaphost) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <AreaAction
                        parameter={parameters[idx]}
                        onChangeParameter={onChangeParameter}
                        idx={idx}
                        onClickDeleteArea={onClickDeleteArea}
                        extractedTextList={results}
                        onEditText={onEditText}
                        type={type}
                        trialArea={trialAreas[idx]}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {setResults.length > 0 && (
        <div>
          <Button
            variant="contained"
            onClick={onClickSubmit}
            sx={{ width: "100%" }}
            disabled={loadingSubmit}
            startIcon={loadingSubmit ? <CircularProgress size="1rem" /> : <></>}
          >
            Submit
          </Button>
        </div>
      )}
      <div>Num of areas: {areas.length}</div>
    </>
  );
};

export default AreaActions;
