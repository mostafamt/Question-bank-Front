import Text from "../components/DrawnUI/Text/Text";
import Image from "../components/DrawnUI/Image/Image";
import Video from "../components/DrawnUI/Video/Video";
import Sound from "../components/DrawnUI/Sound/Sound";
import Boolean from "../components/DrawnUI/Boolean/Boolean";

export const AUTO_UI_TYPES_MAPPING = {
  text: <Text />,
  number: <Text />,
  color: <Text />,
  image: <Image />,
  video: <Video />,
  voice: <Sound />,
  Bool: <Boolean />,
};
