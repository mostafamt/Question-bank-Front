import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useQuery } from "@tanstack/react-query";

import styles from "./playObjectModal.module.scss";
import { getObject } from "../../../api/bookapi";

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
    // enabled: shouldFetch,
  });

  let renderer = <></>;
  if (workingArea.contentType === "Paragraph") {
    renderer = workingArea.contentValue;
  } else {
    if (isLoadingObject) {
      renderer = <p>Loading</p>;
    } else {
      setShouldFetch(true);
      renderer = isFetching ? (
        <p>Loading...</p>
      ) : (
        <iframe src={object?.url} frameborder="0"></iframe>
      );
    }
  }

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{renderer}</BootstrapModal.Body>
    </div>
  );
};

export default PlayObjectModal;
