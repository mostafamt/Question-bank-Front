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
import { emptyValues, isRequired, searchIfRequired } from "../../utils/data";
import ObjectUI from "../../components/DrawnUI/ObjectUI/ObjectUI";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";

import styles from "./drawnUI.module.scss";
import { getTypeOfKey } from "./data";
import Select from "../../components/DrawnUI/Select/Select";
import { getQuestionTypes, getTypes } from "../../services/api";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const DrawnUI = () => {
  const params = useParams();
  const { type } = params;
  const [questionTypes, setQuestionTypes] = React.useState([]);
  const [foundAbstractParameters, setFoundAbstractParameters] =
    React.useState(true);
  const [abstractParameters, setAbstractParameters] = React.useState();
  const [values, setValues] = React.useState({});
  const location = useLocation();
  const [isEditPage] = React.useState(
    location.pathname.startsWith("/edit-question")
  );
  const [labels, setLabels] = React.useState([]);
  const { data: state } = useStore();

  const schema = yup
    .object({
      option: yup.array().min(2),
    })
    .required();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: async () => getData(),
    // resolver: yupResolver(schema),
  });

  const getParameters = async () => {
    const res = await axios.get(`/interactive-objects/${params.id}`);
    const data = res.data;
    return data.parameters;
  };

  const getData = async () => {
    const res = await getTypes();
    const objects = res.data;
    const selectedType = objects.find((item) => item.typeName === type);
    const abstractParameter = selectedType?.abstractParameter;
    const labels = selectedType?.labels;
    setLabels(labels);
    setAbstractParameters(abstractParameter);
    setFoundAbstractParameters(Boolean(abstractParameter));
    if (isEditPage) {
      const parameters = await getParameters();
      console.log("parameters= ", parameters);
      return parameters;
    } else {
      return emptyValues(abstractParameter);
    }
  };

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

      const type = getTypeOfKey(labels, key) || value;
      let required = searchIfRequired(labels, key);

      let commonProps = {
        errors,
        path: level === 1 ? [key] : [arrayName, index, key],
        value: level === 1 ? key : `${arrayName}.${index}.${key}`,
        register: register,
      };

      if (type === "text" || type === "number" || type === "color") {
        item = (
          <Text
            space={space}
            label={key}
            required={required}
            type={type}
            {...commonProps}
            control={control}
          />
        );
      } else if (type === "image") {
        item = (
          <Image
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
            getValues={getValues}
          />
        );
      } else if (type === "video") {
        item = (
          <Video
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
            getValues={getValues}
          />
        );
      } else if (type === "voice") {
        item = (
          <Sound
            register={{ ...register(param) }}
            setValue={setValue}
            param={param}
            space={space}
            getValues={getValues}
          />
        );
      } else if (type === "Bool") {
        item = (
          <BooleanComponent register={{ ...register(param) }} space={space} />
        );
      } else if (Array.isArray(type)) {
        const object = emptyValues(type[0]);

        item = (
          <ArrayUI
            value={type}
            parseParameters={parseParameters}
            space={space}
            level={level}
            label={key}
            control={control}
            object={object}
            errors={errors}
          />
        );
      } else if (typeof type === "object") {
        item = (
          <ObjectUI
            type={type}
            parseParameters={parseParameters}
            space={space}
            level={level}
            label={key}
            control={control}
          />
        );
      } else if (type.includes("DropList")) {
        const options = type.split(":")?.[1]?.split(",");
        item = (
          <Select
            label={key}
            options={options}
            space={space}
            required={required}
            control={control}
            {...commonProps}
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
