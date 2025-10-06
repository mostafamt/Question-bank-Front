import React from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "../../axios";
import Alert from "@mui/material/Alert";
import { Box, Button, CircularProgress } from "@mui/material";
import ArrayUI from "../../components/DrawnUI/ArrayUI/ArrayUI";
import { useForm } from "react-hook-form";
import { emptyValues, ignoreSpaces } from "../../utils/data";
import ObjectUI from "../../components/DrawnUI/ObjectUI/ObjectUI";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";

import Select from "../../components/DrawnUI/Select/Select";
import { getAllTypes, getObject } from "../../services/api";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  AUTO_UI_TYPES_MAPPING,
  getSchema,
  getTypeOfKey,
  searchIfHintExist,
  searchIfRequired,
} from "../../utils/auto-ui";

import styles from "./drawnUI.module.scss";
import Wrapper from "../../components/DrawnUI/Wrapper/Wrapper";
import { useQuery } from "@tanstack/react-query";

const DrawnUI = () => {
  const params = useParams();
  const { type, baseType, id } = params;
  const [foundAbstractParameters, setFoundAbstractParameters] =
    React.useState(true);
  const [selectedType, setSelectedType] = React.useState(null);
  const [abstractParameters, setAbstractParameters] = React.useState([]);
  const [values, setValues] = React.useState({});
  const location = useLocation();
  const [isEditPage] = React.useState(
    location.pathname.startsWith("/edit-question")
  );
  const [loading, setLoading] = React.useState(false);
  const [labels, setLabels] = React.useState([]);
  const { data: state } = useStore();

  const schema = getSchema(abstractParameters, labels);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: async () => getData(),
  });

  const getParameters = async () => {
    const res = await axios.get(`/interactive-objects/${params.id}`);
    const data = res.data;
    return data.parameters;
  };

  const { data: object, isFetching: isFetchingObject } = useQuery({
    queryKey: [`object`],
    queryFn: () => getObject(id),
    refetchOnWindowFocus: false,
    enabled: isEditPage && Boolean(id), // Disable auto-fetch
  });

  const getData = async () => {
    setLoading(true);
    const objects = await getAllTypes();
    const selectedType = objects.find((item) => item.typeName === baseType);
    setSelectedType(selectedType);
    const abstractParameter = selectedType?.abstractParameter;
    const labels = selectedType?.labels;
    setLabels(labels);
    setAbstractParameters(abstractParameter);
    setFoundAbstractParameters(Boolean(abstractParameter));
    if (isEditPage) {
      const parameters = await getParameters();
      setLoading(false);
      return parameters;
    } else {
      setLoading(false);
      return emptyValues(abstractParameter);
    }
  };

  const onSubmit = async (values) => {
    console.log("onSubmit");
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
      IR: state.IR,
      domainName: state.domainName,
      subDomainName: state.subDomainName,
      parameters: {
        ...values,
      },
    };
    try {
      const res = await axios.post("/interactive-objects", data);
      toast.success(`Object added successfully`);
      window.open(`/show/${res.data}`, "_blank");
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
      const url = res.data;
      window.open(`/show/${res.data}`, "_blank");
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

      let properties = {
        errors,
        path: level === 1 ? [key] : [arrayName, index, key],
        name: level === 1 ? key : `${arrayName}.${index}.${key}`,
        register: register,
        space: space,
        label: key,
        required: searchIfRequired(labels, key),
        type: ignoreSpaces(value) || getTypeOfKey(labels, key),
        control: control,
        setValue: setValue,
        getValues: getValues,
        parseParameters: parseParameters,
        hint: searchIfHintExist(selectedType?.hints, key),
      };

      let flag = false;
      for (const [auto_ui_key, auto_ui_value] of Object.entries(
        AUTO_UI_TYPES_MAPPING
      )) {
        if (auto_ui_key === properties?.type) {
          flag = true;
          const comp = (
            <Wrapper space={properties.space} hint={properties.hint}>
              {React.cloneElement(auto_ui_value, properties)}
            </Wrapper>
          );
          item = comp;
        }
      }

      if (!flag) {
        if (Array.isArray(properties?.type)) {
          const object = emptyValues(properties?.type[0]);
          item = <ArrayUI {...properties} object={object} />;
        } else if (typeof properties?.type === "object") {
          item = <ObjectUI {...properties} />;
        } else if (properties?.type.includes("DropList")) {
          const options = properties?.type.split(":")?.[1]?.split(",");
          item = (
            <Wrapper space={properties.space} hint={properties.hint}>
              <Select {...properties} options={options} />
            </Wrapper>
          );
        }
      }

      jsx = (
        <React.Fragment>
          {jsx}
          {item}
        </React.Fragment>
      );
    }

    console.log("errors= ", errors);

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
      {loading ? (
        <Box sx={{ textAlign: "center", mt: "8rem" }}>
          <CircularProgress size="4rem" />
        </Box>
      ) : (
        <>
          <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
            {abstractParameters && parseParameters(abstractParameters)}
          </form>
          <pre>{JSON.stringify(values, null, 4)}</pre>
        </>
      )}
    </div>
  );
};

export default DrawnUI;
