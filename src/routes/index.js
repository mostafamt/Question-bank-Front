import DrawnUI from "../pages/DrawnUI/DrawnUI";
import ExcelFile from "../components/ExcelFile/ExcelFile";
import Bulk from "../components/MultipleChoice/Bulk/Bulk";
import MultipleChoice from "../components/MultipleChoice/MultipleChoice";
import Show from "../components/Show/Show";
import TrueFalse from "../components/TrueFalse/TrueFalse";
import AddObject from "../pages/AddObject/AddObject";
import DragTheWords from "../pages/DragTheWords/DragTheWords";
import EditObject from "../pages/EditObject/EditObject";
import EssayQuestion from "../pages/Essay-Question/EssayQuestion";
import FillBlankForm from "../pages/FillBlank/FillBlank";
import Home from "../pages/Home/Home";
import MultipleChoiceForm from "../pages/MultipleChoiceForm/MultipleChoiceForm";
import ScanAndUpload from "../pages/ScanAndUpload/ScanAndUpload";
import SmartInteractive from "../pages/SmartInteractive/SmartInteractive";
import Test from "../pages/Test/Test";
import Test2 from "../pages/Test/Test2";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/true-false",
    component: TrueFalse,
  },
  {
    path: "/fill-blank",
    component: FillBlankForm,
  },
  {
    path: "/multiple-choice",
    component: MultipleChoice,
  },
  {
    path: "/show/:id",
    component: Show,
  },
  {
    path: "/bulk",
    component: Bulk,
  },
  {
    path: "/add-question",
    component: AddObject,
  },
  {
    path: "/add-question/:type",
    component: DrawnUI,
  },
  {
    path: "/scan-and-upload",
    component: ScanAndUpload,
  },
  {
    path: "/add-question/multiple-choice/manual",
    component: MultipleChoiceForm,
  },
  {
    path: "/add-question/smart-interactive",
    component: SmartInteractive,
  },
  {
    path: "/add-question/drag-the-words/manual",
    component: DragTheWords,
  },
  {
    path: "/add-question/true-false/manual",
    component: DragTheWords,
  },
  {
    path: "/add-question/filltheblanks/manual",
    component: FillBlankForm,
  },
  {
    path: "/add-question/filltheblanks/manual/:id",
    component: FillBlankForm,
  },
  {
    path: "/add-question/essay-question/manual",
    component: EssayQuestion,
  },
  {
    path: "/dragthewords",
    component: DragTheWords,
  },
  {
    path: "/dragthewords/:id",
    component: DragTheWords,
  },
  {
    path: "/edit/:id",
    component: EditObject,
  },
  {
    path: "/edit-question/:type/:id",
    component: DrawnUI,
  },
  {
    path: "/excel-file",
    component: ExcelFile,
  },
  {
    path: "/test",
    component: Test,
  },
  {
    path: "/test2",
    component: Test2,
  },
];

export default routes;
