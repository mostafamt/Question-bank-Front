import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import axios from "../../axios";

import Modal from "../../components/Modal/Modal";
import DeleteModalContent from "../../components/Modal/DeleteModalContent/DeleteModalContent";
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

const questionTypeList = ["Multiple Choice", "True False", "Fill In The Blank"];

const EditObject = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: async () => getData(),
  });
  const params = useParams();
  const { id } = params;

  const getData = async () => {
    const res = await axios.get(`/question/${id}`);
    console.log(res.data);
    return {
      name: res.data.name,
      objectOwner: res.data.objectOwner,
      domain: res.data.domain,
      subDomain: res.data.subDomain,
      topic: res.data.topic,
      language: res.data.language,
      type: res.data.type,
    };
  };

  React.useEffect(() => {
    getData();
  }, []);

  const onClickCancel = () => {
    navigate("/");
  };

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onClickQuestionEdit = () => {
    navigate(`/question/${id}`);
  };

  const onConfirmDelete = async () => {
    closeModal();
    try {
      await axios.delete(`/question/${id}`);
      toast.success("Question deleted successfully");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (values) => {
    try {
      await axios.put(`/${id}`, values);
      toast.success("Question updated Successfully !");
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
                  name="type"
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
                <Button variant="contained" size="large" type="submit">
                  Save
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  type="button"
                  onClick={onClickQuestionEdit}
                >
                  Question Edit
                </Button>
                <Button variant="contained" size="large" onClick={openModal}>
                  Delete
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onClickCancel}
                >
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
