import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { useForm } from "react-hook-form";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import Modal from "../../components/Modal/Modal";
import DeleteModalContent from "../../components/Modal/DeleteModalContent/DeleteModalContent";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./editObject.module.scss";

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

const EditObject = () => {
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
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: async () => fetchData(),
  });
  const { setFormState } = useStore();

  const fetchData = async () => {
    const res = await axios.get(`/question/${id}`);
    console.log(res.data);
    return {
      ...res.data,
      questionType: res.data.type,
    };
  };

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onConfirmDelete = async () => {
    closeModal();
    try {
      const res = await axios.delete(`/question/${id}`);
      toast.success("Question deleted successfully");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {}, [values.name, valid]);

  const onClickDelete = () => {
    openModal();
  };

  const onClickCancel = () => {
    navigate("/");
  };

  const onClickEdit = () => {
    const { questionType } = watch();

    if (questionType === "multiple-choice") {
      navigate(`/edit-question/${id}`);
    }
  };

  const onSubmit = async (values) => {
    try {
      const res = await axios.put(`/question/${id}`, {
        ...values,
      });
      toast.success("Question updated successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Modal show={showModal} handleClose={closeModal}>
        <DeleteModalContent
          handleClose={closeModal}
          onDelete={onConfirmDelete}
        />
      </Modal>

      <div className={styles["edit-object"]}>
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
                  name="questionType"
                  register={register}
                  errors={errors}
                  disabled={true}
                >
                  {questionTypeList.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div className={styles.actions}>
                <Button variant="contained" type="submit">
                  Save
                </Button>
                <Button variant="contained" onClick={onClickEdit}>
                  Edit Question
                </Button>
                <Button variant="contained" onClick={onClickDelete}>
                  Delete
                </Button>
                <Button variant="contained" onClick={onClickCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </>
  );
};

export default EditObject;
