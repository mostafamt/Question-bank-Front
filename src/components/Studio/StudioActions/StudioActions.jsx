import React from "react";
import { Button, CircularProgress, List } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import AreaAction from "../../AreaAction/AreaAction";
import { DELETED, reorder } from "../../../utils/ocr";

import styles from "./studioActions.module.scss";

const StudioActions = (props) => {
  const {
    areasProperties,
    setAreasProperties,
    activePage,
    onEditText,
    onClickDeleteArea,
    type,
    onClickSubmit,
    loadingSubmit,
    updateAreaProperty,
    updateAreaPropertyById,
    types,
    onChangeLabel,
    subObject,
    setModalName,
    openModal,
    setWorkingArea,
  } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    return areasProperties;

    // TODO
    // Need to fix

    const orderArray = areasProperties[activePage].map((area) => area.order);

    console.log("orderArray= ", orderArray);

    const newOrderArray = reorder(
      orderArray,
      result.source.index,
      result.destination.index
    );

    const mergedOrderArray = [...areasProperties];

    mergedOrderArray[activePage] = areasProperties[activePage].map(
      (item, idx) => ({
        ...item,
        order: newOrderArray[idx],
      })
    );

    setAreasProperties(mergedOrderArray);
  };

  return (
    <div className={styles["studio-actions"]}>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-id">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {[...areasProperties[activePage]]
                  ?.sort((a, b) => a.order - b.order)
                  // .filter((item) => item.status !== DELETED)
                  .map((area, idx) => (
                    <Draggable key={area.id} draggableId={area.id} index={idx}>
                      {(provided, snaphost) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          key={area.id}
                          style={{
                            display: area.status === DELETED ? "none" : "block",
                          }}
                        >
                          <AreaAction
                            parameter={area.parameter}
                            idx={idx}
                            onClickDeleteArea={onClickDeleteArea}
                            onEditText={onEditText}
                            type={type}
                            area={area}
                            updateAreaProperty={updateAreaProperty}
                            updateAreaPropertyById={updateAreaPropertyById}
                            types={types}
                            onChangeLabel={onChangeLabel}
                            subObject={subObject}
                            setModalName={setModalName}
                            openModal={openModal}
                            setWorkingArea={setWorkingArea}
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

        {areasProperties[activePage].length > 0 && (
          <div>
            <Button
              variant="contained"
              onClick={onClickSubmit}
              sx={{ width: "100%" }}
              disabled={loadingSubmit}
              startIcon={
                loadingSubmit ? <CircularProgress size="1rem" /> : <></>
              }
            >
              Submit
            </Button>
          </div>
        )}
        <div>Num of areas: {areasProperties[activePage].length}</div>
      </List>
    </div>
  );
};

export default StudioActions;
