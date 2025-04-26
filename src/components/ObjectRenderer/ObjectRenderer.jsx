import React from "react";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./objectRenderer.module.scss";

const ObjectRenderer = (props) => {
  const { id } = props;
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const getData = React.useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      setUrl(res.data?.url);
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
    <div className={styles["object-renderer"]}>
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

export default ObjectRenderer;
