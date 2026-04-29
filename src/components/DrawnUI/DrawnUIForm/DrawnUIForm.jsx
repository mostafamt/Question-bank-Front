import React from "react";
import axios from "../../../axios";
import Alert from "@mui/material/Alert";
import { Box, Button, CircularProgress } from "@mui/material";
import ArrayUI from "../ArrayUI/ArrayUI";
import { useForm } from "react-hook-form";
import { emptyValues, ignoreSpaces } from "../../../utils/data";
import ObjectUI from "../ObjectUI/ObjectUI";
import { useStore } from "../../../store/store";
import { toast } from "react-toastify";
import Select from "../Select/Select";
import { getAllTypes } from "../../../services/api";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AUTO_UI_TYPES_MAPPING,
  getSchema,
  getTypeOfKey,
  groupOneOfFields,
  searchIfHintExist,
  searchIfRequired,
} from "../../../utils/auto-ui";
import styles from "../../../pages/DrawnUI/drawnUI.module.scss";
import Wrapper from "../Wrapper/Wrapper";
import OneOfUI from "../OneOfUI/OneOfUI";

const DrawnUIForm = ({ baseType, initialValues, initialColors, objectId, onSuccess }) => {
  const isEditMode = Boolean(objectId);

  const [foundAbstractParameters, setFoundAbstractParameters] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState(null);
  const [abstractParameters, setAbstractParameters] = React.useState([]);
  const [values, setValues] = React.useState({});
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
    const res = await axios.get(`/interactive-objects/${objectId}`);
    return res.data.parameters;
  };

  const getData = async () => {
    setLoading(true);
    const objects = await getAllTypes();
    const found = objects.find((item) => item.typeName === baseType);
    setSelectedType(found);
    const abstractParameter = found?.abstractParameter;
    const foundLabels = found?.labels;
    setLabels(foundLabels);
    setAbstractParameters(abstractParameter);
    setFoundAbstractParameters(Boolean(abstractParameter));
    setLoading(false);
    if (isEditMode) {
      const saved = await getParameters();
      return remapToAbstractKeys(saved, abstractParameter);
    }
    return initialValues ?? emptyValues(abstractParameter);
  };

  const onSubmit = async (formValues) => {
    setValues(formValues);
    if (isEditMode) {
      await editObject(formValues);
    } else {
      await saveObject(formValues);
    }
  };

  const saveObject = async (formValues) => {
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
      parameters: { ...formValues },
    };
    try {
      const res = await axios.post("/interactive-objects", data);
      toast.success("Object added successfully");
      window.open(`/show/${res.data}`, "_blank");
      onSuccess?.();
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const editObject = async (formValues) => {
    try {
      const res = await axios.patch(`/interactive-objects/${objectId}`, {
        parameters: { ...formValues },
      });
      toast.success("Object updated successfully");
      window.open(`/show/${res.data}`, "_blank");
      onSuccess?.();
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const renderSingleField = (key, value, space, level, index, arrayName) => {
    const properties = {
      errors,
      path: level === 1 ? [key] : [arrayName, index, key],
      name: level === 1 ? key : `${arrayName}.${index}.${key}`,
      register,
      space,
      label: key,
      required: searchIfRequired(labels, key),
      type: ignoreSpaces(value) || getTypeOfKey(labels, key),
      control,
      setValue,
      getValues,
      parseParameters,
      hint: searchIfHintExist(selectedType?.hints, key),
      initialColor: (() => {
        const entry = initialColors?.[key];
        if (!entry) return null;
        if (Array.isArray(entry)) return entry[index] ?? null;
        return entry;
      })(),
    };

    for (const [auto_ui_key, auto_ui_value] of Object.entries(AUTO_UI_TYPES_MAPPING)) {
      if (auto_ui_key === properties.type) {
        return (
          <Wrapper space={properties.space} hint={properties.hint}>
            {React.cloneElement(auto_ui_value, properties)}
          </Wrapper>
        );
      }
    }

    if (Array.isArray(properties.type)) {
      const object = emptyValues(properties.type[0]);
      return <ArrayUI {...properties} object={object} />;
    } else if (typeof properties.type === "object") {
      return <ObjectUI {...properties} />;
    } else if (properties.type.includes("DropList")) {
      const options = properties.type.split(":")?.[1]?.split(",");
      return (
        <Wrapper space={properties.space} hint={properties.hint}>
          <Select {...properties} options={options} />
        </Wrapper>
      );
    }

    return null;
  };

  const parseParameters = (
    abstractParams,
    space = 4,
    level = 1,
    index = 0,
    arrayName = ""
  ) => {
    let jsx = "";
    const groups = groupOneOfFields(abstractParams, labels);

    for (const group of groups) {
      let item = "";
      if (group.oneOf) {
        item = (
          <OneOfUI
            key={group.fields.map((f) => f.key).join("-")}
            fields={group.fields}
            labels={labels}
            space={space}
            level={level}
            index={index}
            arrayName={arrayName}
            setValue={setValue}
            getValues={getValues}
            renderSingleField={renderSingleField}
          />
        );
      } else {
        item = renderSingleField(group.key, group.value, space, level, index, arrayName);
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
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 4 }}>
              <span>Submit</span>
              {isSubmitting && <CircularProgress />}
            </Button>
          </Box>
        )}
      </>
    );
  };

  if (!foundAbstractParameters) {
    return <Alert severity="error">Abstract Parameters is missing!</Alert>;
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: "4rem" }}>
        <CircularProgress size="4rem" />
      </Box>
    );
  }

  return (
    <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
      {abstractParameters && parseParameters(abstractParameters)}
    </form>
  );
};

function remapToAbstractKeys(savedParams, abstractParameter) {
  if (!savedParams || !abstractParameter) return savedParams;
  const result = {};
  for (const [abstractKey, abstractValue] of Object.entries(abstractParameter)) {
    if (Array.isArray(abstractValue)) {
      const abstractBase = abstractKey.replace(/\s*\d+$/, "").trim().toLowerCase();
      const savedKey = Object.keys(savedParams).find(
        (k) => k.replace(/\s*\d+$/, "").trim().toLowerCase() === abstractBase
      );
      result[abstractKey] = savedKey ? savedParams[savedKey] : [];
    } else {
      result[abstractKey] = savedParams[abstractKey] ?? "";
    }
  }
  return result;
}

export default DrawnUIForm;
