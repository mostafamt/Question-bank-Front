import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useForm } from "react-hook-form";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ScannerIcon from "@mui/icons-material/Scanner";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
} from "../../config";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./addObject.module.scss";

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

  const getQuestionTypes = async () => {
    const res = await axios.get("interactive-object-types");
    const types = res.data.map((item) => item.typeName);
    setTypes(types);
  };

  React.useEffect(() => {
    getQuestionTypes();
  }, []);

  const onClickExcelFile = () => {
    window.open("/excel-file", "_blank");
  };

  const onSubmit = async (values) => {
    const data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
    };
    const id = await saveObject(data);
    setFormState({ id, ...data });
    const { type } = values;
    if (type === "MCQ") {
      navigate("/add-question/multiple-choice/manual");
    } else if (type === "true-false") {
      navigate("/add-question/true-false/manual");
    } else if (type === "fill-in-the-blank") {
      navigate("/add-question/fill-in-the-blank/manual");
    } else if (type === "drag-the-words") {
      navigate("/add-question/drag-the-words/manual");
    } else if (values.questionType === "essay-question") {
      navigate("/add-question/essay-question/manual");
    }
  };

  const onSubmitOcr = async (values) => {
    const data = {
      ...values,
      domainName: getDomainName(values.domainId),
      subDomainName: getSubDomainName(values.domainId, values.subDomainId),
    };
    const id = await saveObject(data);
    setFormState({ id, ...data });
    navigate("/scan-and-upload");
  };

  const saveObject = async (data) => {
    const res = await axios.post("/interactive-objects", {
      ...data,
      isAnswered: "g", // g, y , r
      parameters: {},
    });
    toast.success("Question created successfully!");
    return res.data;
  };

  return (
    <div className={styles["add-question"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Add Question Object</legend>
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
                label="question type"
                name="type"
                register={register}
                errors={errors}
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
                startIcon={<ScannerIcon />}
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
