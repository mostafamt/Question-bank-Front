import React from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios";
import { toast } from "react-toastify";

import ShowIFrame from "./ShowIFrame/ShowIFrame";
import SnapLearningPlayer from "./SnapLearningPlayer/SnapLearningPlayer";
import styles from "./show.module.scss";

const Show = () => {
  const [object, setObject] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  let { id } = useParams();

  const getData = React.useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      setObject(res.data);
    } catch (error) {
      console.log(error);
      toast.error(`${error?.message}, please try again later!`);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getData(id);
  }, [id, getData]);

  if (loading) return <p>Loading...</p>;

  if (!object) return null;

  if (object.baseType === "SnapLearning Object") {
    return <SnapLearningPlayer data={object} />;
  }

  return (
    <div className={`container ${styles.questions}`}>
      <ShowIFrame title={object.title} url={object.url} />
    </div>
  );
};

export default Show;
