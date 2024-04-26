import React from "react";
import axios from "../../axios";

import styles from "./test.module.scss";

const objectElements = {
  objectElements: [
    {
      question: "what is your name here?",
    },
    {
      optionText: "Ahmed",
    },
    {
      correct: false,
    },
    {
      chosenFeedback: "chosen feedback text",
    },
    {
      notChosenFeedback: "not chosen feedback text",
    },
    {
      tip: "Is your name Ahmed?",
    },
    {
      optionText: "Ali",
    },
    {
      correct: true,
    },
    {
      chosenFeedback: "chosen feedback text2",
    },
    {
      notChosenFeedback: "not chosen feedback text",
    },
    {
      tip: "Is your name Ali?",
    },
  ],
};

const Test = () => {
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    console.log("onSubmitHandler");

    const url1 =
      "https://questions-api-osxg.onrender.com/api/interactive-objects";

    const res = await axios.post(url1, {
      questionName: "dummy",
    });
    const id = res.data;

    const url2 = `https://questions-api-osxg.onrender.com/api/saveObjectMCQ/${id}`;

    await axios.post(url2, objectElements, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        Accept: "*/*",
        Connection: "keep-alive",
      },
    });
  };

  return (
    <>
      <form onSubmit={onSubmitHandler}>
        <h1>Just submit form</h1>
        <button type="submit">submit</button>
      </form>
    </>
  );
};

export default Test;
