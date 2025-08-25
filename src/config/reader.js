import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookIcon from "@mui/icons-material/Book";
import StudyBook from "../../src/components/StudyBook/StudyBook";

export const tabsConfig = [
  {
    label: "The Book",
    icon: <MenuBookIcon />,
    children: [
      { label: "Study Book", component: <StudyBook /> },
      { label: "Work Book", component: <div>Work Book</div> },
      { label: "Activity Book", component: <div>Activity Book</div> },
    ],
  },
  {
    label: "Review Book",
    icon: <BookIcon />,
    children: [
      { label: "Review Booklet", component: <div>Review Booklet</div> },
      {
        label: "Exam Style Questions",
        component: <div>Exam Style Questions</div>,
      },
      { label: "Check Yourself", component: <div>Check Yourself</div> },
      { label: "Headlights Booklet", component: <div>Headlights Booklet</div> },
    ],
  },
];
