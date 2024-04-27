import React from "react";

import styles from "./test.module.scss";
import Modal from "../../components/Modal/Modal";
import SubObjectModal from "../../components/Modal/SubObjectModal/SubObjectModal";

const Test2 = () => {
  const [image, setImage] = React.useState("");
  const [showModal, setShowModal] = React.useState(false);

  const uploadImage = async () => {
    const path = "/assets/cats.jpg";
    const url = "www.google.com";
    setImage(url);
    return url;
  };

  React.useEffect(() => {
    uploadImage();
  }, []);

  const onChangeHandler = (file) => {
    console.log("file= ", file);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Modal show={showModal} handleClose={handleCloseModal} size="xl">
        <SubObjectModal
          handleClose={handleCloseModal}
          // image={activeImage}
          name=""
          type=""
          setResults={() => {}}
          parameter={""}
          y={""}
        />
      </Modal>
      <div>
        <button onClick={() => setShowModal(true)}>open modal</button>
      </div>

      {Array(20)
        .fill(null)
        .map((_) => (
          <h1>Hello world</h1>
        ))}
    </>
  );
};

export default Test2;
