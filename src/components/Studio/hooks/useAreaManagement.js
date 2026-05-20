import React from "react";
import { v4 as uuidv4 } from "uuid";

const useAreaManagement = () => {
  const [areas, setAreas] = React.useState([]);
  const [trialAreas, setTrialAreas] = React.useState([]);

  const onChangeHandler = (areasParam) => {
    let newAreas = [];
    for (let i = 0; i < trialAreas.length; i++) {
      newAreas = [
        ...newAreas,
        {
          x: areasParam[i].x,
          y: areasParam[i].y,
          width: areasParam[i].width,
          height: areasParam[i].height,

          id: trialAreas[i].id,
          color: trialAreas[i].color,
          loading: trialAreas[i].loading,
          text: trialAreas[i].text,
          image: trialAreas[i].image,
          parameter: trialAreas[i].parameter,
          order: trialAreas[i].order,
          open: trialAreas[i].open,
          type: trialAreas[i].type,
        },
      ];
    }

    if (areasParam.length > trialAreas.length) {
      newAreas = [
        ...newAreas,
        {
          x: areasParam[areasParam.length - 1].x,
          y: areasParam[areasParam.length - 1].y,
          width: areasParam[areasParam.length - 1].width,
          height: areasParam[areasParam.length - 1].height,

          id: uuidv4(),
          color: null,
          loading: false,
          text: "",
          image: "",
          parameter: "Select a parameter",
          order: areasParam.length - 1,
          open: true,
        },
      ];
    }

    setTrialAreas([...newAreas]);
    setAreas(areasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setTrialAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const updateTrialAreas = (idx, value) => {
    console.log("updateTrialAreas");
    console.log("value= ", value);
    setTrialAreas((prevState) => {
      let newTrialAreas = [...prevState];

      if (idx === -1) {
        const lastIndex = trialAreas.length - 1;
        newTrialAreas[lastIndex] = { ...newTrialAreas[lastIndex], ...value };
      } else {
        newTrialAreas[idx] = { ...newTrialAreas[idx], ...value };
      }

      return newTrialAreas;
    });
  };

  return {
    areas,
    setAreas,
    trialAreas,
    setTrialAreas,
    onChangeHandler,
    onClickDeleteArea,
    updateTrialAreas,
  };
};

export default useAreaManagement;

// src/components/Studio/hooks/useAreaManagement.js
