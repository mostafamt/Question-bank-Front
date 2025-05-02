import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useForm } from "react-hook-form";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ScannerIcon from "@mui/icons-material/Scanner";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button, CircularProgress } from "@mui/material";
import {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
} from "../../config";
import { useQuery } from "@tanstack/react-query";
import { NewInstance as axios } from "../../axios";
import { toast } from "react-toastify";
import { getCategories, getQuestionTypes, getTypes } from "../../services/api";

import styles from "./addObject.module.scss";
import { getImages, getAllTypes } from "../../services/api";
import { getBaseTypeFromType, instructionalRoles } from "../../utils/helper";

const AddObject = () => {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const { setFormState } = useStore();
  // const [types, setTypes] = React.useState([]);
  const [loadingOCR, setLoadingOCR] = React.useState(false);
  const [interactiveObjectTypes, setInteractiveObjectTypes] = React.useState(
    []
  );

  const getQuestionTypes = async () => {
    const res = await getAllTypes();
    setInteractiveObjectTypes(res);
    const types = res.map((item) => item.typeName);
    // setTypes(types);
  };

  React.useEffect(() => {
    getQuestionTypes();
  }, []);

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: [`categories`],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });

  const { data: types, isFetching: isFetchingTypes } = useQuery({
    queryKey: [`types-${watch("category")}`],
    queryFn: () => getTypes(watch("category") === "Question" ? "Q" : "X"),
    refetchOnWindowFocus: false,
    enabled: !!watch("category"), // Disable auto-fetch
  });

  const onClickExcelFile = () => {
    window.open("/excel-file", "_blank");
  };

  const onSubmit = async (values) => {
    const domainName = getDomainName(values.domainId);
    const subDomainName = getSubDomainName(values.domainId, values.subDomainId);

    const data = {
      ...values,
      domainName,
      subDomainName,
      objects: interactiveObjectTypes,
    };
    setFormState({ ...data });
    const { type } = values;

    const baseType = getBaseTypeFromType(categories, watch("category"), type);
    navigate(`/add-question/${watch("type")}/${baseType}`);
  };

  const onSubmitOcr = async (values) => {
    let data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
      higherType: values.type,
    };

    const { type } = values;
    const baseType = getBaseTypeFromType(categories, watch("category"), type);
    data = { ...data, type: baseType };
    const selectedTypeObject = interactiveObjectTypes.find(
      (item) => item.typeName === baseType
    );
    console.log("data= ", data);
    setFormState({
      // id,
      ...data,
      labels: selectedTypeObject.labels,
      types: interactiveObjectTypes,
    });
    navigate("/scan-and-upload");
  };

  const onSubmitAutoGen = async (values) => {
    let data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
      higherType: values.type,
    };

    const { type } = values;
    const baseType = getBaseTypeFromType(categories, watch("category"), type);
    data = { ...data, type: baseType };
    const selectedTypeObject = interactiveObjectTypes.find(
      (item) => item.typeName === baseType
    );
    console.log("data= ", data);
    setFormState({
      // id,
      ...data,
      labels: selectedTypeObject.labels,
      types: interactiveObjectTypes,
    });
    navigate("/scan-and-upload");
  };

  let labels = [];
  if (categories) {
    const category = categories.find(
      (category) => category.typeName === watch("category")
    );
    labels = category?.labels;
  }

  return (
    <div className={styles["add-question"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Add Object</legend>
          <div>
            <Input
              label="title"
              name="questionName"
              type="text"
              register={register}
              errors={errors}
            />
            <div className={styles.row}>
              <Select
                label="object owner"
                name="objectOwner"
                register={register}
                errors={errors}
              >
                {ownerList.map((item, idx) => (
                  <option key={idx} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                label="domain"
                name="domainId"
                register={register}
                errors={errors}
              >
                {domainList?.map((domain, idx) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.row}>
              <Select
                label="sub domain"
                name="subDomainId"
                register={register}
                errors={errors}
              >
                {subDomainList?.[watch().domainId]?.map((subDomain, idx) => (
                  <option key={subDomain.id} value={subDomain.id}>
                    {subDomain.name}
                  </option>
                ))}
              </Select>
              <Input
                label="topic"
                name="topic"
                register={register}
                errors={errors}
              />
            </div>
            <div className={styles.row}>
              <Select
                label="language"
                name="language"
                register={register}
                errors={errors}
              >
                {languageList.map((item, idx) => (
                  <option key={idx} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Category"
                name="category"
                register={register}
                errors={errors}
                loading={isFetchingCategories}
              >
                {categories?.map((category, idx) => (
                  <option key={idx} value={category.typeName}>
                    {category.typeName}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.row}>
              <Select
                label="Instructional Role"
                name="IR"
                register={register}
                errors={errors}
              >
                {instructionalRoles?.map((item, idx) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                label="type"
                name="type"
                register={register}
                errors={errors}
              >
                {labels?.map((item, idx) => (
                  <option key={idx} value={Object.keys(item)?.[0]}>
                    {Object.keys(item)?.[0]}
                  </option>
                ))}
              </Select>
            </div>

            <div className={styles.actions}>
              <Button
                variant="contained"
                startIcon={<DesignServicesIcon />}
                type="submit"
              >
                Manual Form
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmitAutoGen)}
                startIcon={<AutoFixHighIcon />}
              >
                Auto Gen
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmitOcr)}
                startIcon={
                  loadingOCR ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <ScannerIcon />
                  )
                }
                disabled={loadingOCR}
              >
                Scan and Upload
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddObject;
