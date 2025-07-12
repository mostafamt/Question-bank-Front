import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../store/store";
import PlayObject from "./PlayObject/PlayObject";
import QuillModal from "./QuillModal/QuillModal";

const Modals = () => {
  const { data: state, setFormState } = useStore();

  const name = state.modal?.name || "";
  const size = state.modal?.size || "xl";
  const opened = state.modal?.opened || false;

  const closeModal = () => {
    setFormState({
      ...state,
      modal: {
        ...state.modal,
        opened: false,
      },
    });
  };

  let modalContent = <></>;

  if (name === "") {
    modalContent = <h1>some modal content</h1>;
  } else if (name === "play-object") {
    modalContent = <PlayObject />;
  } else if (name === "quill-modal") {
    const { value, setValue, onClickSubmit } = state.modal.props;

    modalContent = (
      <QuillModal
        value={value}
        setValue={setValue}
        onClickSubmit={onClickSubmit}
      />
    );
  }

  return (
    <BootstrapModal show={opened} onHide={closeModal} size={size}>
      {modalContent}
    </BootstrapModal>
  );
};

export default Modals;
