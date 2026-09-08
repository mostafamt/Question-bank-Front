import React from "react";
import ScanAndUpload from "../ScanAndUpload/ScanAndUpload";

import styles from "./reader.module.scss";
import Chat from "../../components/Chat/Chat";
import ReaderRightPanel from "../../components/ReaderRightPanel/ReaderRightPanel";

const Reader = () => {
  return (
    <div className={`container ${styles.reader}`}>
      <div>
        <Chat />
      </div>
      <div>
        <ScanAndUpload />
      </div>
      <div>
        <ReaderRightPanel />
      </div>
    </div>
  );
};

export default Reader;
