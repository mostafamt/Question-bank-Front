import React from "react";
import { AreaSelector, IArea } from "@bmunozg/react-image-area";

const Test2 = () => {
  const [areas, setAreas] = React.useState([]);

  const onChangeHandler = (areas) => {
    setAreas(areas);
  };

  const onClick = () => {
    alert(JSON.stringify(areas));
  };

  return (
    <>
      <AreaSelector areas={areas} onChange={onChangeHandler}>
        <img src="/assets/questions.jpg" alt="cats" />
      </AreaSelector>

      <button onClick={onClick}>Show info</button>
    </>
  );
};

export default Test2;
