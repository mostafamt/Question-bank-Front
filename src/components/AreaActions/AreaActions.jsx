import React from "react";
import AreaAction from "../AreaAction/AreaAction";
import { Button, CircularProgress } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { reorder } from "../../utils/ocr";

import List from "@mui/material/List";

const AreaActions = (props) => {
  const {
    onEditText,
    onClickDeleteArea,
    type,
    onClickSubmit,
    loadingSubmit,
    trialAreas,
    setTrialAreas,
    updateTrialAreas,
    types,
    onChangeAreaItem,
    onChangeLabel,
    subObject,
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
    <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
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
                          idx={idx}
                          onClickDeleteArea={onClickDeleteArea}
                          onEditText={onEditText}
                          type={type}
                          trialArea={trialArea}
                          updateTrialAreas={updateTrialAreas}
                          types={types}
                          onChangeAreaItem={onChangeAreaItem}
                          onChangeLabel={onChangeLabel}
                          subObject={subObject}
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
    </List>
  );
};

export default AreaActions;
