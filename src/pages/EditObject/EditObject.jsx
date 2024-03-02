import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import { Button } from "@mui/material";
import Modal from "../../components/Modal/Modal";
import DeleteModalContent from "../../components/Modal/DeleteModalContent/DeleteModalContent";
import axios from "../../axios";
import { toast } from "react-toastify";
import {
  ownerList,
  domainList,
  languageList,
  subDomainList,
  getDomainName,
  getSubDomainName,
} from "../../config";

import styles from "./editObject.module.scss";

const questionTypeList = [
  "multiple-choice",
  "true-false",
  "fill-in-the-blank",
  "essay-question",
];

const EditObject = () => {
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
  const [types, setTypes] = React.useState([]);

  const fetchData = async () => {
    const res = await axios.get(`/interactive-objects/${id}`);
    console.log(res.data);
    return {
      ...res.data,
      type: res.data.type,
    };
  };

  React.useEffect(() => {
    getQuestionTypes();
  }, []);

  const getQuestionTypes = async () => {
    const res = await axios.get("interactive-object-types");
    const types = res.data.map((item) => item.typeName);
    setTypes(types);
  };

  const closeModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onConfirmDelete = async () => {
    closeModal();
    try {
      await axios.delete(`/interactive-objects/${id}`);
      toast.success("Question deleted successfully");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const onClickDelete = () => {
    openModal();
  };

  const onClickCancel = () => {
    navigate("/");
  };

  const onClickEdit = () => {
    const { type } = watch();

    if (type === "MCQ") {
      navigate(`/edit-question/${id}`);
    } else if (type === "fill-in-the-blank") {
      navigate(`/add-question/filltheblanks/manual/${id}`);
    }
  };

  const onSubmit = async (values) => {
    try {
      const res = await axios.patch(`/interactive-objects/${id}`, {
        ...values,
        domainName: getDomainName(values.domainId),
        subDomainName: getSubDomainName(values.domainId, values.subDomainId),
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
                  {domainList.map((domain, idx) => (
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
                  disabled={true}
                >
                  {types.map((type, idx) => (
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
