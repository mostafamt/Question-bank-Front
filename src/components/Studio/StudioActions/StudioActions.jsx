import React from "react";
import { Button, CircularProgress, List, IconButton } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import AreaAction from "../../AreaAction/AreaAction";
import { DELETED, reorder } from "../../../utils/ocr";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

import styles from "./studioActions.module.scss";

// large | medium | small
const iconFontSize = "medium";
// const text

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
    tOfActiveType: typeOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    onClickToggleVirutalBlocks,
    showVB,
  } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    return areasProperties;

    // TODO
    // Need to fix

    const orderArray = areasProperties[activePage].map((area) => area.order);

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
      <div>
        <div>
          <IconButton
            aria-label="visibility-icon"
            onClick={onClickToggleVirutalBlocks}
          >
            {showVB ? (
              <VisibilityIcon fontSize={iconFontSize} />
            ) : (
              <VisibilityOffIcon fontSize={iconFontSize} />
            )}
          </IconButton>
        </div>
      </div>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-id">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {[...areasProperties[activePage]]
                  // ?.sort((a, b) => a.order - b.order)
                  .filter((item) => item.status !== DELETED)
                  ?.map((area, idx) => (
                    <Draggable key={area.id} draggableId={area.id} index={idx}>
                      {(provided, snaphost) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          key={area.id}
                          style={{
                            display: area.status === DELETED ? "none" : "block",
                            overflow: "hidden",
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
                            typeOfActiveType={typeOfActiveType}
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

        {subObject && areasProperties[activePage]?.length === 0 && (
          <div>
            <div>
              <Button
                variant="contained"
                onClick={onSubmitAutoGenerate}
                sx={{ width: "100%" }}
                disabled={loadingAutoGenerate}
                startIcon={
                  loadingAutoGenerate ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <AutoFixHighIcon size="1rem" />
                  )
                }
              >
                Auto Generate
              </Button>
            </div>
          </div>
        )}

        {areasProperties[activePage]?.length > 0 && (
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
        <div>Num of areas: {areasProperties[activePage]?.length}</div>
      </List>
    </div>
  );
};

export default StudioActions;
