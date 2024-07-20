import React from "react";
import { Draggable } from "react-beautiful-dnd";

const draggableSamples = [
  {
    id: "1",
    name: "Drag-1",
  },
  {
    id: "2",
    name: "Drag-2",
  },
  {
    id: "3",
    name: "Drag-3",
  },
  {
    id: "4",
    name: "Drag-4",
  },
  {
    id: "5",
    name: "Drag-5",
  },
];

const SampleDrag = () => {
  const draggables = draggableSamples.map((draggable, index) => (
    <Draggable draggableId={draggable.id} key={draggable.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {draggable.name}
        </div>
      )}
    </Draggable>
  ));

  return draggables;
};

export default SampleDrag;
