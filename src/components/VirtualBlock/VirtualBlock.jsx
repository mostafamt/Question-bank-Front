import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";
import {
  CREATED,
  DELETED,
  VIRTUAL_BLOCK_MENU,
} from "../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import { DeleteForever } from "@mui/icons-material";
import axios from "../../axios";
import { toast } from "react-toastify";
import { useStore } from "../../store/store";

import styles from "./virtualBlock.module.scss";

const VirtualBlock = (props) => {
  const {
    openModal,
    setModalName,
    checkedObject,
    setCheckedObject,
    label,
    showVB,
  } = props;

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
    if (showVB) {
      getData(checkedObject?.id);
    }
  }, [checkedObject?.id, getData, showVB]);

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
      status: CREATED,
    });
  };

  const onClickCloseButton = () => {
    setValue("");
    setCheckedObject({
      ...checkedObject,
      status: DELETED,
    });
  };

  const onClickPlayButton = () => {
    console.log("onClickPlayButton");
    setModalName("play-object-2");
    setFormState({
      ...state,
      activeId: checkedObject?.id,
    });
    openModal();
  };

  const selectedItem = VIRTUAL_BLOCK_MENU.find(
    (item) => item.label === checkedObject?.label
  );

  console.log("selectedItem= ", selectedItem);

  return (
    <div className={styles["virtual-block"]}>
      {checkedObject?.status && checkedObject?.status !== DELETED ? (
        <div className={styles.block}>
          <div className={styles.header}>
            <span>{checkedObject?.label}</span>
            <IconButton
              color="inherit"
              aria-label="close"
              size="small"
              onClick={onClickCloseButton}
            >
              <DeleteForever color="error" sx={{ fontSize: 16 }} />
            </IconButton>
          </div>
          <div>
            <IconButton
              color="primary"
              aria-label="play"
              onClick={onClickPlayButton}
              sx={{ padding: 0 }}
            >
              <img src={selectedItem?.iconSrc} alt="compass" width="50px" />
            </IconButton>
          </div>
          {/* <div>{name}</div> */}
        </div>
      ) : (
        <div className={styles["select"]}>
          <MuiSelect
            list={VIRTUAL_BLOCK_MENU.map((item) => item.label)}
            value={value}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

export default VirtualBlock;
