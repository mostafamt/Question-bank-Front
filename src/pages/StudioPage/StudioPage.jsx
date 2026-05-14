import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Studio from "../../components/Studio/Studio";
import { useStore } from "../../store/store";
import { getAllTypes, getObject } from "../../services/api";
import Loader from "../../components/Loader/Loader";
import styles from "./studioPage.module.scss";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";

const StudioPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { object_id } = useParams();
  const { images: initialImages, questionName: stateQuestionName, type: stateType } = location.state || {};

  const [images, setImages] = React.useState(initialImages || []);
  const [typesReady, setTypesReady] = React.useState(false);
  const [resolvedType, setResolvedType] = React.useState(stateType ?? null);
  const [resolvedQuestionName, setResolvedQuestionName] = React.useState(stateQuestionName ?? null);

  const { data: state, setFormState } = useStore();

  React.useEffect(() => {
    const init = async () => {
      let finalType = stateType;
      let finalQuestionName = stateQuestionName;

      if (object_id) {
        const obj = await getObject(object_id);
        if (obj) {
          finalType = obj.type ?? stateType;
          finalQuestionName = obj.questionName ?? stateQuestionName;
        }
      }

      setResolvedType(finalType);
      setResolvedQuestionName(finalQuestionName);

      const allTypes = state.types ?? (await getAllTypes());
      if (!allTypes) return;

      const selectedType = allTypes.find((t) => t.typeName === finalType);
      setFormState({
        ...state,
        questionName: finalQuestionName,
        type: finalType,
        types: allTypes,
        labels: selectedType?.labels,
      });
      setTypesReady(true);
    };

    init();
  }, []);

  if (!initialImages?.length || !stateQuestionName) {
    return (
      <div className="container">
        <p>Missing required data. Please go back and upload images first.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!typesReady) {
    return <Loader text="Loading..." />;
  }

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      <QuestionNameHeader name={resolvedQuestionName} type={resolvedType} />
      <Studio
        images={images}
        setImages={setImages}
        questionName={resolvedQuestionName}
        type={resolvedType}
        objectId={object_id ?? null}
      />
    </div>
  );
};

export default StudioPage;
