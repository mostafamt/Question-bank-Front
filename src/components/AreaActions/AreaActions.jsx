import React from "react";
import AreaAction from "../AreaAction/AreaAction";
import { Button, CircularProgress } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { reorder } from "../../utils/ocr";

const AreaActions = (props) => {
  const {
    onChangeParameter,
    onEditText,
    onClickDeleteArea,
    type,
    onClickSubmit,
    loadingSubmit,
    trialAreas,
    setTrialAreas,
  } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const orderArray = trialAreas.map((area) => area.order);

    console.log("orderArray= ", orderArray);

    const newOrderArray = reorder(
      orderArray,
      result.source.index,
      result.destination.index
    );

    const mergedOrderArray = trialAreas.map((item, idx) => ({
      ...item,
      order: newOrderArray[idx],
    }));

    setTrialAreas(mergedOrderArray);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-id">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {[...trialAreas]
                .sort((a, b) => a.order - b.order)
                .map((trialArea, idx) => (
                  <Draggable
                    key={trialArea.id}
                    draggableId={trialArea.id}
                    index={idx}
                  >
                    {(provided, snaphost) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <AreaAction
                          parameter={trialArea.parameter}
                          onChangeParameter={onChangeParameter}
                          idx={idx}
                          onClickDeleteArea={onClickDeleteArea}
                          onEditText={onEditText}
                          type={type}
                          trialArea={trialArea}
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

      {trialAreas.length > 0 && (
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
      <div>Num of areas: {trialAreas.length}</div>
    </>
  );
};

export default AreaActions;
