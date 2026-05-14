import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Studio from "../../components/Studio/Studio";
import { useStore } from "../../store/store";
import { getAllTypes } from "../../services/api";
import Loader from "../../components/Loader/Loader";

const StudioPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { object_id } = useParams();
  const { images: initialImages, questionName, type } = location.state || {};

  const [images, setImages] = React.useState(initialImages || []);
  const [typesReady, setTypesReady] = React.useState(false);

  const { data: state, setFormState } = useStore();

  React.useEffect(() => {
    if (state.types) {
      setTypesReady(true);
      return;
    }
    getAllTypes().then((allTypes) => {
      if (!allTypes) return;
      const selectedType = allTypes.find((t) => t.typeName === type);
      setFormState({
        ...state,
        questionName,
        type,
        types: allTypes,
        labels: selectedType?.labels,
      });
      setTypesReady(true);
    });
  }, []);

  if (!initialImages?.length || !questionName || !type) {
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
    <Studio
      images={images}
      setImages={setImages}
      questionName={questionName}
      type={type}
      objectId={object_id ?? null}
    />
  );
};

export default StudioPage;
