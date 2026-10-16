import React from "react";
import { Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../axios";
import { upload } from "../../utils/upload";
import styles from "./smartObjectForm.module.scss";

const getFileCategory = (file) => {
  const fileType = file.type.toLowerCase();
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileType.startsWith("video/") || fileExtension === "mp4") {
    return "video";
  }

  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];
  const documentExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];

  if (documentTypes.includes(fileType) || documentExtensions.includes(fileExtension)) {
    return "document";
  }

  return null;
};

const getInteractiveParameters = (file, url, isInteractive) => {
  if (!isInteractive) return {};

  const fileCategory = getFileCategory(file);

  if (fileCategory === "video") {
    return {
      _Video_: url,
      _VideoDescription_: "",
      Interactions: [],
      Sections: [],
      _Summary_: ""
    };
  }

  if (fileCategory === "document") {
    return {
      _Doc_: url,
      _Description_: "",
      Interactions: [],
      Sections: [],
      _Summary_: ""
    };
  }

  return {};
};

const SmartObjectUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.state?.title || "test";
  const object = location.state?.object || {};
  const domainName = location.state?.domainName || "";
  const subDomainName = location.state?.subDomainName || "";
  const [file, setFile] = React.useState(null);
  const [isInteractive, setIsInteractive] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const url = await upload(file);
      if (!url) return;

      const res = await axios.post("/interactive-objects", {
        ...object,
        questionName: title,
        questionOrExplanation: "S",
        isInteractive,
        domainName,
        subDomainName,
        url,
        parameters: getInteractiveParameters(file, url, isInteractive)
      });

      toast.success("Object added successfully");
      const fileCategory = getFileCategory(file);
      if (isInteractive && fileCategory) {
        const interactiveType =
          fileCategory === "video" ? "Interactive Video" : "Interactive Document";
        const encodedType = encodeURIComponent(interactiveType);
        navigate(`/edit-question/${encodedType}/${encodedType}/${res.data}`);
      } else {
        navigate(`/show/${res.data}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["smart-object-form"]}>
      <fieldset>
        <legend>{title}</legend>
        <input
          className={styles.file}
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <label>
          <input
            type="checkbox"
            checked={isInteractive}
            onChange={(event) => setIsInteractive(event.target.checked)}
          />
          Is interactive
        </label>
      </fieldset>
      <div className={styles.actions}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SmartObjectUpload;