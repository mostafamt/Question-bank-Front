import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ModalHeader from "../ModalHeader/ModalHeader";
import { useQuery } from "@tanstack/react-query";

import { getObject } from "../../../api/bookapi";
import { useStore } from "../../../store/store";

const PlayObjectModal2 = ({ isFullscreen }) => {
  const { data: state } = useStore();

  const id = state.activeId;

  const {
    data: object,
    isFetching,
  } = useQuery({
    queryKey: [`get-object`, id],
    queryFn: () => getObject(id),
    refetchOnWindowFocus: false,
  });

  let renderer = <></>;

  renderer = isFetching ? (
    <p>Loading...</p>
  ) : object?.url ? (
    <iframe
      title="play-object"
      src={object?.url}
      frameBorder="0"
      height={"100%"}
      width={"100%"}
    ></iframe>
  ) : (
    <p>No Object url is available.</p>
  );

  return (
    // Full screen: the dialog is already viewport-high, so let flex size it
    <div style={isFullscreen ? undefined : { height: "100vh" }}>
      <ModalHeader>{object?.questionName}</ModalHeader>
      <BootstrapModal.Body
        style={isFullscreen ? undefined : { height: "100%" }}
      >
        {renderer}
      </BootstrapModal.Body>
    </div>
  );
};

export default PlayObjectModal2;
