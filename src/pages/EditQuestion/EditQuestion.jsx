import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ScannerIcon from "@mui/icons-material/Scanner";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import axios from "../../axios";

import styles from "./editQuestion.module.scss";

const ownerList = ["me", "azharengineering2020", "Public"];

const domainList = [
  "Science",
  "Scube Test Domain",
  "English",
  "Mathematics",
  "اللغة العربية",
];

const languageList = [
  "English",
  "Arabic",
  "French",
  "Spanish",
  "Italian",
  "German",
];

const subDomainList = {
  Science: ["Chemistry", "Biology", "Physics", "Earth And Space"],
  "Scube Test Domain": ["كتاب الفقه", "كتاب التاريخ", "كتاب الجغرافيا"],
  English: [
    "Grammar",
    "Reading-Fiction",
    "Reading-None Fiction",
    "Reading-Play Scripts",
    "Poetry",
    "Writing",
    "Listening",
  ],
  Mathematics: ["Arithmetic", "Algebra", "Geometry", "Statistics"],
  "اللغة العربية": ["قراءة", "محفوظات", "نحو", "تعبير", "خط"],
};

const questionTypeList = ["multiple-choice", "true-false", "fill-in-the-blank"];

const EditQuestion = () => {
  const [values, setValues] = React.useState({
    name: "",
    ownerList: ownerList,
    owner: "",
    languageList: languageList,
    domainList: domainList,
    domain: "",
    subDomain: "",
    question_type: questionTypeList[0],
  });
  const [valid, setValid] = React.useState(false);
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: async () => getData(),
  });
  const { setFormState } = useStore();
  const params = useParams();
  const { id } = params;

  const getData = async () => {
    const res = await axios.get(`/question/${id}`);
    console.log(res.data);
    return {
      name: res.data.name,
      domain: res.data.domain,
      subDomain: res.data.subDomain,
    };
  };

  React.useEffect(() => {
    getData();
  }, []);

  const checkValidity = () => {
    if (Boolean(values.name)) {
      setValid(true);
    } else {
      setValid(false);
    }
    console.log("valid= ", valid);
  };

  const onChangeValues = (name, value) => {
    setValues((prevState) => ({ ...prevState, [name]: value }));
    console.log("hello");
    checkValidity();
  };

  const onClickManualForm = () => {
    console.log("onClickManualUpload");
    window.open(`/manual-form/${values.question_type}`, "_blank");
  };

  const onClickExcelFile = () => {
    window.open("/excel-file", "_blank");
  };

  const onClickScanAndUpload = () => {
    console.log("onClickScanAndUpload");
  };

  const onSubmit = (values) => {
    console.log("values= ", values);
    setFormState(values);
    console.log(values.question_type);
    if (values.question_type === "multiple-choice") {
      navigate("/add-question/multiple-choice/manual");
    } else if (values.question_type === "true-false") {
      navigate("/add-question/true-false/manual");
    } else if (values.question_type === "fill-in-the-blank") {
      navigate("/add-question/filltheblanks/manual");
    }
  };

  console.log("watch= ", watch());

  return (
    <div className={styles["edit-question"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Edit Question Object</legend>
          <div>
            <Input
              label="title"
              name="name"
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
                name="domain"
                register={register}
                errors={errors}
              >
                {domainList.map((domain, idx) => (
                  <option key={idx} value={domain}>
                    {domain}
                  </option>
                ))}
              </Select>
            </div>
            <div className={styles.row}>
              <Select
                label="sub domain"
                name="subDomain"
                register={register}
                errors={errors}
              >
                {subDomainList["Science"].map((item, idx) => (
                  <option key={idx} value={item}>
                    {item}
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
                  <option key={idx} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                label="question type"
                name="question_type"
                register={register}
                errors={errors}
              >
                {questionTypeList.map((type, idx) => (
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
                onClick={onClickScanAndUpload}
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

export default EditQuestion;
