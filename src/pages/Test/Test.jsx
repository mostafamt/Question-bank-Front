import React from "react";
import "react-quill/dist/quill.snow.css";
/** @jsxImportSource @emotion/react */

import styles from "./test.module.scss";

const Test = () => {
  const targetRef = React.useRef(null);
  const [isStickyVisible, setStickyVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(entry);
        // If the target is NOT visible → show sticky content
        setStickyVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    if (targetRef.current) {
      console.log(targetRef.current);
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Sticky content appears only after you scroll past the target */}
      {isStickyVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            background: "#333",
            color: "#fff",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          I'm sticky now!
        </div>
      )}

      {/* Page content */}
      <div style={{ height: "1000px", paddingTop: "150px" }}>
        <h2>Scroll down...</h2>

        {/* Target div to observe */}
        <div
          ref={targetRef}
          style={{
            marginTop: "500px",
            height: "100px",
            background: "#f0f0f0",
            textAlign: "center",
            lineHeight: "100px",
          }}
        >
          Watch me disappear!
        </div>

        <p style={{ marginTop: "300px" }}>More content below</p>
      </div>
    </>
  );
};

export default Test;
