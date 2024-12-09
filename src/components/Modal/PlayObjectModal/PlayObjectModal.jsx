import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useQuery } from "@tanstack/react-query";

import styles from "./playObjectModal.module.scss";
import { getObject } from "../../../api/bookapi";
import { isComplexType } from "../../../utils/ocr";

const PlayObjectModal = (props) => {
  const { workingArea } = props;
  const [shouldFetch, setShouldFetch] = React.useState(false);

  const {
    data: object,
    isError: isErrorObject,
    isLoading: isLoadingObject,
    isSuccess: isSuccessObject,
    isFetching,
  } = useQuery({
    queryKey: [`get-object`],
    queryFn: () => getObject(workingArea.contentValue),
    refetchOnWindowFocus: false,
  });

  let renderer = <></>;

  if (isComplexType(workingArea.contentType)) {
    renderer = isFetching ? (
      <p>Loading...</p>
    ) : (
      <iframe
        src={object?.url}
        frameBorder="0"
        height={"100%"}
        width={"100%"}
      ></iframe>
    );
  } else {
    renderer = workingArea.contentValue;
  }

  return (
    <div style={{ height: "50vh" }}>
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
