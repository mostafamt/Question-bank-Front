import React from "react";
import { useParams } from "react-router-dom";
// import { BACKEND_URL } from "../../config/config";
import styles from "./show.module.scss";
import ShowIFrame from "./ShowIFrame/ShowIFrame";

const Show = () => {
  return <h1>Show</h1>;
  // const [data, setData] = React.useState({});
  // let { id } = useParams();

  // const getData = React.useCallback(async (id) => {
  //   const res = await fetch(`${BACKEND_URL}/question?id=${id}`);
  //   const data = await res.json();
  //   setData(data);
  // }, []);

  // React.useEffect(() => {
  //   getData(id);
  // }, [getData, id]);

  // return (
  //   <div className={`container ${styles.questions}`}>
  //     <ShowIFrame title={data?.name} url={data.url} />
  //   </div>
  // );
};

export default Show;
