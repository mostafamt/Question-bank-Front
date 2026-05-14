import React from "react";
import { useModalStore } from "../../store/modalStore";
import DrawnUIModal from "./DrawnUIModal/DrawnUIModal";

const REGISTRY = {
  DrawnUIModal,
};

const ModalRegistry = () => {
  const { name, props, closeModal } = useModalStore();

  if (!name) return null;

  const ModalComponent = REGISTRY[name];
  if (!ModalComponent) return null;

  return <ModalComponent open={true} onClose={closeModal} {...props} />;
};

export default ModalRegistry;
