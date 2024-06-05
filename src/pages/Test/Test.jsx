import { useForm } from "react-hook-form";

const Test = () => {
  const { register, handleSubmit } = useForm();

  const OnSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(OnSubmit)}>
      <input ref={register} type="file" name="picture" />
      <button>submit</button>
    </form>
  );
};

export default Test;
