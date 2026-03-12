import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useQuery } from "@tanstack/react-query";

import styles from "./playObjectModal.module.scss";
import { getObject } from "../../../api/bookapi";
import { isComplexType } from "../../../utils/ocr";
import SnapLearningPlayer from "../../SnapLearningPlayer/SnapLearningPlayer";

const PlayObjectModal = (props) => {
  const { workingArea } = props;

  const {
    data: object,
    isError: isErrorObject,
    isLoading: isLoadingObject,
    isSuccess: isSuccessObject,
    isFetching,
  } = useQuery({
    queryKey: [`get-object`],
    queryFn: () =>
      getObject(
        workingArea.isServer ? workingArea.text : workingArea.contentValue
      ),
    refetchOnWindowFocus: false,
  });

  let renderer = <></>;

  if (object?.baseType === "SnapLearning Object") {
    renderer = isFetching ? <p>Loading...</p> : <SnapLearningPlayer data={object} />;
  } else if (isComplexType(workingArea.contentType || workingArea.typeOfLabel)) {
    renderer = isFetching ? (
      <p>Loading...</p>
    ) : object?.url ? (
      <iframe
        src={object?.url}
        frameBorder="0"
        height={"100%"}
        width={"100%"}
      ></iframe>
    ) : (
      <p>No Object url is available.</p>
    );
  } else {
    renderer = workingArea.contentValue;
  }

  return (
    <div style={{ height: "100vh" }}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body style={{ height: "100%" }}>
        {renderer}
      </BootstrapModal.Body>
    </div>
  );
};

export default PlayObjectModal;
