import React from "react";
import { useParams } from "react-router-dom";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./show.module.scss";

const Show = () => {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  let { id } = useParams();

  const getData = React.useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`createObject/${id}`);
      setUrl(res.data);
    } catch (error) {
      console.log(error);
      toast.error(`${error?.message}, please try again later!`);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getData(id);
  }, [id, getData]);

  return (
    <div className={`container ${styles.questions}`}>
      {!loading ? (
        <iframe
          id="inlineFrameExample"
          title="Inline Frame Example"
          height="100vh"
          width="100%"
          src={url}
        ></iframe>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Show;
