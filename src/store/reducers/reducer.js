import * as actionTypes from "../actionTypes";

let initializeState = {
  questions: [],
};

const reducer = (state = initializeState, action) => {
  switch (action.type) {
    case actionTypes.STORE_QUESTIONS:
      return {
        ...state,
        questions: [...action.questions],
      };
    default:
      return {
        ...state,
      };
  }
};

export default reducer;
