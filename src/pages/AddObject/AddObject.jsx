import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useForm } from "react-hook-form";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ScannerIcon from "@mui/icons-material/Scanner";
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
import { NewInstance as axios } from "../../axios";
import { toast } from "react-toastify";
import { getQuestionTypes } from "../../services/api";

import styles from "./addObject.module.scss";
import { getImages, getTypes } from "../../services/api";

const AddObject = () => {
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm();
  const { setFormState } = useStore();
  const [types, setTypes] = React.useState([]);
  const [loadingOCR, setLoadingOCR] = React.useState(false);
  const [interactiveObjectTypes, setInteractiveObjectTypes] = React.useState(
    []
  );

  const getQuestionTypes = async () => {
    const res = await getTypes();
    setInteractiveObjectTypes(res.data);
    let types = res.data.filter((item) => item.typeCategory === "B");
    types = types.map((item) => item.typeName);
    setTypes(types);
  };

  React.useEffect(() => {
    getQuestionTypes();
  }, []);

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
    navigate(`/add-question/${type}`);
  };

  const onSubmitOcr = async (values) => {
    const data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
    };

    // const id = await saveObject(data);
    const selectedTypeObject = interactiveObjectTypes.find(
      (item) => item.typeName === values.type
    );
    setFormState({
      // id,
      ...data,
      labels: selectedTypeObject.labels,
      types: interactiveObjectTypes,
    });
    navigate("/scan-and-upload");
  };

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
                label="object type"
                name="type"
                register={register}
                errors={errors}
                loading={!types.length}
              >
                {types.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
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
                onClick={onClickExcelFile}
                startIcon={<InsertDriveFileIcon />}
              >
                Excel File
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
