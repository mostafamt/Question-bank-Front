import React from "react";
import Input from "../../components/Input/Input";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import axios from "../../axios";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";

const AddType = () => {
  const location = useLocation();
  const params = useParams();

  const fetchData = async () => {
    if (location.pathname === "/add-type") {
      return {
        typeName: "",
        questionOrExplanation: "",
        labels: "",
        templateUrl: "",
        abstractParameter: "",
      };
    } else {
      const { id } = params;
      const res = await axios.get(`/io-types/${id}`);
      console.log("res= ", res);
      return {
        typeName: "",
        questionOrExplanation: "",
        labels: "",
        templateUrl: "",
        abstractParameter: "",
      };
    }
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: async () => await fetchData(),
  });

  const onSubmit = async (values) => {
    console.log("onSubmit");
    try {
      const res = await axios.post("/interactive-object-types", {
        ...values,
        abstractParameter: JSON.parse(values.abstractParameter),
      });
      const data = res.data;
      toast.success("Type added successfully!");
      console.log("data= ", data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mb-4">Add Type</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="typeName"
          name="typeName"
          type="text"
          register={register}
          errors={errors}
        />
        <Input
          label="questionOrExplanation"
          name="questionOrExplanation"
          type="text"
          register={register}
          errors={errors}
        />
        <Input
          label="labels"
          name="labels"
          type="text"
          register={register}
          errors={errors}
        />
        <Input
          label="templateUrl"
          name="templateUrl"
          type="text"
          register={register}
          errors={errors}
        />
        <Input
          label="abstractParameter"
          name="abstractParameter"
          type="text"
          register={register}
          errors={errors}
        />
        <div className="mb-4 text-center">
          <Button variant="contained" type="submit">
            submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddType;
