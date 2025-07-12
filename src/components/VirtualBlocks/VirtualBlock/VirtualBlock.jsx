import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import {
  CREATED,
  DELETED,
  NOTES,
  SUMMARY,
  VIRTUAL_BLOCK_MENU,
} from "../../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import { DeleteForever } from "@mui/icons-material";
import axios from "../../../axios";
import { toast } from "react-toastify";
import { useStore } from "../../../store/store";
import clsx from "clsx";

import styles from "./virtualBlock.module.scss";

const VirtualBlock = (props) => {
  const {
    openModal,
    setModalName,
    checkedObject,
    setCheckedObject,
    label,
    showVB,
    reader,
  } = props;

  const [value, setValue] = React.useState("");
  const [header, setHeader] = React.useState("");

  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  const { data: state, setFormState, openModal: openModalGlobal } = useStore();

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
    if (
      showVB &&
      checkedObject.label !== NOTES &&
      checkedObject.label !== SUMMARY
    ) {
      getData(checkedObject?.id);
    }
  }, [checkedObject?.id, getData, showVB]);

  const onClickSubmitForText = (header, value) => {
    console.log("value= ", value);
    setFormState({
      ...state,
      virtual_block_label: header,
      virtual_block_key: label,
    });
    setCheckedObject({
      label: header,
      id: value,
      status: CREATED,
    });
  };

  const onChange = (e) => {
    const _header = e.target.value;
    setHeader(_header);
    if (_header === NOTES || _header === SUMMARY) {
      setFormState({
        ...state,
        modal: {
          ...state.modal,
          name: "quill-modal",
          opened: true,
          props: {
            value,
            setValue,
            onClickSubmit: (value) => onClickSubmitForText(_header, value),
          },
        },
      });
    } else {
      setModalName("virtual-blocks");
      openModal();
      setFormState({
        ...state,
        virtual_block_label: _header,
        virtual_block_key: label,
      });
      setCheckedObject({
        label: _header,
        id: checkedObject?.id,
        status: CREATED,
      });
    }
  };

  const onClickCloseButton = () => {
    setHeader("");
    setCheckedObject({
      ...checkedObject,
      status: DELETED,
    });
  };

  const onClickPlayButton = () => {
    if (checkedObject.label === NOTES || checkedObject.label === SUMMARY) {
      setFormState({
        ...state,
        modal: {
          ...state.modal,
          name: "quill-modal",
          opened: true,
          props: {
            value: checkedObject.id,
            setValue,
            onClickSubmit: (value) =>
              onClickSubmitForText(checkedObject.label, value),
          },
        },
      });
    } else {
      setModalName("play-object-2");
      setFormState({
        ...state,
        activeId: checkedObject?.id,
      });
      openModal();
    }
  };

  const onClickPlayButtonForReader = () => {
    console.log("checkedObject= ", checkedObject);
    setFormState({
      ...state,
      modal: {
        ...state.modal,
        name: "play-object",
        opened: true,
        id: checkedObject.id,
      },
    });
  };

  const selectedItem = VIRTUAL_BLOCK_MENU.find(
    (item) => item.label === checkedObject?.label
  );

  return (
    <div
      className={clsx(styles["virtual-block"], styles["reader"])}
      style={{ display: showVB ? "block" : "none" }}
    >
      {checkedObject?.status && checkedObject?.status !== DELETED ? (
        <div className={styles.block}>
          {reader ? (
            <div></div>
          ) : (
            <div className={styles.header}>
              <IconButton
                color="inherit"
                aria-label="close"
                size="small"
                onClick={onClickCloseButton}
              >
                <DeleteForever color="error" />
              </IconButton>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <IconButton
              color="primary"
              aria-label="play"
              onClick={reader ? onClickPlayButtonForReader : onClickPlayButton}
              sx={{ padding: 0 }}
            >
              <img src={selectedItem?.iconSrc} alt="compass" width="50px" />
            </IconButton>
            <div>
              {checkedObject?.label
                .replace(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu, "")
                .trim()}
            </div>
          </div>
          {/* <div>{name}</div> */}
        </div>
      ) : reader ? (
        <div></div>
      ) : (
        <div className={styles["select"]}>
          <MuiSelect
            list={VIRTUAL_BLOCK_MENU.map((item) => item.label)}
            value={header}
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

export default VirtualBlock;
