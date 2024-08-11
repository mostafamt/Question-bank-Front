import React from "react";
import styles from "./showIFrame.module.scss";

const ShowIFrame = (props) => {
  const ref = React.useRef(null);

  const { title, url } = props;

  React.useEffect(() => {
    const handleEvent = (event) => {
      let message = event.data;
      if (message.title === title) {
        ref.current.height = `${message.height}px !important`;
      }
    };

    window.addEventListener("message", handleEvent);

    return () => {
      window.removeEventListener("message", handleEvent);
    };
  }, [title]);

  return (
    <iframe
      title="h5p"
      ref={ref}
      src={url}
      scrolling="no"
      className={styles.iframe}
    ></iframe>
  );
};

export default ShowIFrame;
