import * as actionTypes from "../actionTypes";

export const storeQuestionsAction = (questions) => {
  return {
    type: actionTypes.STORE_QUESTIONS,
    questions: questions,
  };
};
