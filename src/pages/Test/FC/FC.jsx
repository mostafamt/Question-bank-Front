import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import App from "./App/App";

const FC = () => {
  return (
    <DragDropContext>
      <App />
    </DragDropContext>
  );
};

export default FC;
