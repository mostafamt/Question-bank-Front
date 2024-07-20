import React from "react";
import initialData from "./initial-data";
import Column from "./Column/Column";
import { DragDropContext } from "@hello-pangea/dnd";

import styles from "./test.module.scss";
import FC from "./FC/FC";
import Example1 from "./Example1/Example1";
import Example2 from "./Example2/Example2";

const Test = () => {
  const [data, setData] = React.useState(initialData);

  const onDragEnd = (result) => {
    // TODO: reorder our column
  };

  return <Example2 />;
  // return <Example1 />;
  // return (
  //   <DragDropContext onDragEnd={onDragEnd}>
  //     {data.columnOrder.map((columnId) => {
  //       const column = data.columns[columnId];
  //       const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

  //       return <Column key={column.id} column={column} tasks={tasks} />;
  //     })}
  //   </DragDropContext>
  // );
};

export default Test;
