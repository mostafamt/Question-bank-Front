import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";
import { VIRTUAL_BLOCK_MENU } from "../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../../axios";
import { toast } from "react-toastify";
import { useStore } from "../../store/store";

import styles from "./virtualBlock.module.scss";

const VirtualBlock = (props) => {
  const { openModal, setModalName, checkedObject, setCheckedObject, label } =
    props;

  const [value, setValue] = React.useState("");

  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  const { data: state, setFormState } = useStore();

  const getData = React.useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      setName(res.data?.questionName);
      setUrl(res.data?.url);
    } catch (error) {
      console.log(error);
      toast.error(`${error?.message}, please try again later!`);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    getData(checkedObject?.id);
  }, [checkedObject?.id, getData]);

  const onChange = (e) => {
    const header = e.target.value;
    setValue(header);
    setModalName("virtual-blocks");
    openModal();
    setFormState({
      ...state,
      virtual_block_label: header,
      virtual_block_key: label,
    });
    setCheckedObject({
      label: header,
      id: checkedObject?.id,
    });
  };

  const onClickCloseButton = () => {
    setValue("");
    setCheckedObject({
      label: "",
      id: "",
    });
  };

  console.log("checkedObject= ", checkedObject);

  return (
    <div className={styles["virtual-block"]}>
      {checkedObject?.id ? (
        <div className={styles.block}>
          <div className={styles.header}>
            <span>{checkedObject?.label}</span>
            <IconButton
              color="inherit"
              aria-label="close"
              size="small"
              onClick={onClickCloseButton}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </div>
          <div>
            <IconButton color="primary" aria-label="play">
              <PlayArrowIcon />
            </IconButton>
          </div>
          <p>{name}</p>
        </div>
      ) : (
        <MuiSelect
          list={VIRTUAL_BLOCK_MENU}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default VirtualBlock;
