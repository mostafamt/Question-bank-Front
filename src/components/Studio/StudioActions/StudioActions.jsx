import React from "react";
import { Button, CircularProgress, List } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import AreaAction from "../../AreaAction/AreaAction";
import { DELETED, reorder } from "../../../utils/ocr";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import StudioActionsButtons from "../StudioActionsButtons/StudioActionsButtons";

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
    tOfActiveType: typeOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    onSelectFromLibrary,
    onClickToggleVirutalBlocks,
    showVB,
    showBlocksStyling,
    onToggleBlocksStyling,
    isWhiteOutMode,
    onToggleWhiteOutMode,
  } = props;

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    return areasProperties;

    // TODO
    // Need to fix
    // eslint-disable-next-line no-unreachable
    const orderArray = areasProperties[activePage]?.map((area) => area.order);

    const newOrderArray = reorder(
      orderArray,
      result.source.index,
      result.destination.index
    );

    const mergedOrderArray = [...areasProperties];

    mergedOrderArray[activePage] = areasProperties[activePage]?.map(
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
        <StudioActionsButtons
          onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
          showVB={showVB}
          showBlocksStyling={showBlocksStyling}
          onToggleBlocksStyling={onToggleBlocksStyling}
          isWhiteOutMode={isWhiteOutMode}
          onToggleWhiteOutMode={onToggleWhiteOutMode}
        />
      </div>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-id">
            {(provided, snapshot) => (
              <div
                key={snapshot}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {(areasProperties[activePage] || [])
                  // ?.sort((a, b) => a.order - b.order)
                  .filter((item) => item.status !== DELETED)
                  .map((area, idx) => {
                    const key = area.id || `area-${idx}`;
                    return (
                      <Draggable key={key} draggableId={key} index={idx}>
                        {(provided, snaphost) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            style={{
                              display:
                                area.status === DELETED ? "none" : "block",
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
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {subObject && (areasProperties[activePage] || []).length === 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
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
            <Button
              variant="outlined"
              onClick={onSelectFromLibrary}
              sx={{ width: "100%" }}
              startIcon={<LibraryBooksIcon fontSize="small" />}
            >
              Select from Library
            </Button>
          </div>
        )}

        {(areasProperties[activePage] || []).length > 0 && (
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
        <div>Num of areas: {(areasProperties[activePage] || []).length}</div>
      </List>
    </div>
  );
};

export default StudioActions;
