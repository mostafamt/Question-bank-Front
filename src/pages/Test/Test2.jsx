import { useForm } from "react-hook-form";

import axios from "axios";

const Test2 = () => {
  const { register, handleSubmit } = useForm();

  const OnSubmit = (data) => {
    console.log(data);
  };

  <form onSubmit={handleSubmit(OnSubmit)}>
    <input type="file" name="picture" />
    <button type="submit">submit</button>
  </form>;
};

export default Test2;
