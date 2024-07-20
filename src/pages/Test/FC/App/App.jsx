import React from "react";
import { Droppable } from "react-beautiful-dnd";
import SampleDrag from "../SampleDrag/SampleDrag";

const App = () => {
  return (
    <Droppable droppableId="drop-list">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={{ backgroundColor: snapshot.isDraggingOver ? "red" : "green" }}
          {...provided.droppableProps}
        >
          <SampleDrag />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default App;
