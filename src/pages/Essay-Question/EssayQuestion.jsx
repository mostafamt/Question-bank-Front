import React from "react";
import { useStore } from "../../store/store";
import axios from "../../axios";
import { toast } from "react-toastify";

const EssayQuestion = () => {
  const [name, setName] = React.useState("");
  const { data: state } = useStore();

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      parameters: { name },
      isAnswred: true,
      objectOrExplanation: "Q",
      ...state,
    };
    console.log(data);
    await axios.post("/interactive-objects", data);
    toast.success("Question created successfully!");
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Essay Question</h1>
      <div>
        <label>
          <span>name</span>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <button type="submit">submit</button>
      </div>
    </form>
  );
};

export default EssayQuestion;
