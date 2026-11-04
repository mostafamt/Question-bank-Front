import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useQuery } from "@tanstack/react-query";

import { getObject } from "../../../api/bookapi";
import { isObjectId } from "../../../utils/objectId";
import SnapLearningPlayer from "../../SnapLearningPlayer/SnapLearningPlayer";

const PlayObjectModal = (props) => {
  const { workingArea } = props;

  const id = workingArea.isServer ? workingArea.text : workingArea.contentValue;

  const {
    data: object,
    isFetching,
  } = useQuery({
    queryKey: [`get-object`, id],
    queryFn: () => getObject(id),
    enabled: isObjectId(id),
    refetchOnWindowFocus: false,
  });

  let renderer = <></>;

  if (object?.baseType === "SnapLearning Object") {
    renderer = isFetching ? <p>Loading...</p> : <SnapLearningPlayer data={object} />;
  } else if (isObjectId(id)) {
    renderer = isFetching ? (
      <p>Loading...</p>
    ) : object?.url ? (
      <iframe
        title="Interactive object player"
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
        <BootstrapModal.Title>{object?.questionName}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body style={{ height: "100%" }}>
        {renderer}
      </BootstrapModal.Body>
    </div>
  );
};

export default PlayObjectModal;
