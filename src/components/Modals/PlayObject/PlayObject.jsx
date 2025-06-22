import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../../store/store";
import { useQuery } from "@tanstack/react-query";
import { getObject } from "../../../api/bookapi";

const PlayObject = () => {
  const { data: state, setFormState } = useStore();

  const id = state.modal.id;

  const {
    data: object,
    isError: isErrorObject,
    isLoading: isLoadingObject,
    isSuccess: isSuccessObject,
    isFetching,
  } = useQuery({
    queryKey: [`get-object`],
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

export default PlayObject;
