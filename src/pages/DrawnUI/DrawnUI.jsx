import React from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "../../axios";
import Alert from "@mui/material/Alert";
import { Box, Button, CircularProgress } from "@mui/material";
import Image from "../../components/DrawnUI/Image/Image";
import Video from "../../components/DrawnUI/Video/Video";
import Sound from "../../components/DrawnUI/Sound/Sound";
import Text from "../../components/DrawnUI/Text/Text";
import ArrayUI from "../../components/DrawnUI/ArrayUI/ArrayUI";
import { default as BooleanComponent } from "../../components/DrawnUI/Boolean/Boolean";
import { useForm } from "react-hook-form";
import { emptyValues, fillValues } from "../../utils/data";
import ObjectUI from "../../components/DrawnUI/ObjectUI/ObjectUI";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";

import styles from "./drawnUI.module.scss";

const DrawnUI = () => {
  const params = useParams();
  const { type } = params;
  const [foundAbstractParameters, setFoundAbstractParameters] =
    React.useState(true);
  const [abstractParameters, setAbstractParameters] = React.useState();
  const [values, setValues] = React.useState({});
  const location = useLocation();
  const [isEditPage] = React.useState(
    location.pathname.startsWith("/edit-question")
  );
  const { data: state } = useStore();

  const getParameters = async () => {
    const res = await axios.get(`/interactive-objects/${params.id}`);
    const data = res.data;
    return data.parameters;
  };

  const getData = async () => {
    const res = await axios.get("io-types");
    const objects = res.data;
    const selectedType = objects.find(
      (item) => item.typeName === type
    )?.abstractParameter;
    setAbstractParameters(selectedType);
    setFoundAbstractParameters(Boolean(selectedType));
    if (isEditPage) {
      const parameters = await getParameters();
      return parameters;
    } else {
      return emptyValues(selectedType);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: async () => getData(),
  });

  const onSubmit = async (values) => {
    setValues(values);
    if (isEditPage) {
      await EditObject(values);
    } else {
      await saveObject(values);
    }
  };

  const saveObject = async (values) => {
    const data = {
      questionName: state.questionName,
      objectOwner: state.objectOwner,
      domainId: state.domainId,
      subDomainId: state.subDomainId,
      topic: state.topic,
      language: state.language,
      type: state.type,
      domainName: state.domainName,
      subDomainName: state.subDomainName,
      parameters: {
        ...values,
      },
    };
    try {
      const res = await axios.post("/interactive-objects", data);
      toast.success(`Object added successfully`);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const EditObject = async (values) => {
    const data = {
      parameters: {
        ...values,
      },
    };
    try {
      const res = await axios.patch(`/interactive-objects/${params.id}`, data);
      toast.success(`Object updated successfully`);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const parseParameters = (
    abstractParameters,
    space = 4,
    level = 1,
    index = 0,
    arrayName = ""
  ) => {
    let jsx = "";
    for (const [key, value] of Object.entries(abstractParameters)) {
      let item = "";
      let param = level === 1 ? key : `${arrayName}.${index}.${key}`;
      console.log("param= ", param);

      if (value === "text") {
        item = (
          <Text
            space={space}
            label={key}
            register={register}
            level={level}
            value={level === 1 ? key : `${arrayName}.${index}.${key}`}
          />
        );
      } else if (value === "image") {
        item = (
          <Image
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
          />
        );
      } else if (value === "video") {
        item = (
          <Video
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
          />
        );
      } else if (value === "voice") {
        item = (
          <Sound
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
          />
        );
      } else if (value === "Boolean") {
        item = (
          <BooleanComponent register={{ ...register(param) }} space={space} />
        );
      } else if (Array.isArray(value)) {
        const object = emptyValues(value[0]);

        item = (
          <ArrayUI
            value={value}
            parseParameters={parseParameters}
            space={space}
            level={level}
            label={key}
            control={control}
            object={object}
          />
        );
      } else if (typeof value === "object") {
        item = (
          <ObjectUI
            value={value}
            parseParameters={parseParameters}
            space={space}
            level={level}
            label={key}
            control={control}
          />
        );
      }
      jsx = (
        <React.Fragment>
          {jsx}
          {item}
        </React.Fragment>
      );
    }
    return (
      <>
        {jsx}
        {level === 1 && (
          <Box className={styles["submit-box"]}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 4 }}
            >
              <span>Submit</span>
              {isSubmitting && <CircularProgress />}
            </Button>
          </Box>
        )}
      </>
    );
  };

  if (!foundAbstractParameters) {
    return (
      <div className="container">
        <Alert severity="error">Abstract Parameters is missing!</Alert>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "3rem" }}>{type}</h1>
      <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
        {abstractParameters && parseParameters(abstractParameters)}
      </form>
      <pre>{JSON.stringify(values, null, 4)}</pre>
    </div>
  );
};

export default DrawnUI;
