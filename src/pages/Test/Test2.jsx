import React from "react";

import styles from "./test.module.scss";

const Test2 = () => {
  const [image, setImage] = React.useState("");

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

  return (
    <>
      <h1>Hello world</h1>
      <img src={"/assets/cats.jpg"} alt="some here" width={200} />
      <form id="upload">
        <label for="file">File to upload</label>
        <input
          type="file"
          id="file"
          accept="image/*"
          onChange={onChangeHandler}
        />

        <button>Upload</button>
      </form>
    </>
  );
};

export default Test2;
