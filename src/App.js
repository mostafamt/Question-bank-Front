import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TrueFalse from "./components/TrueFalse/TrueFalse";
import Navbar from "./components/Navbar/Navbar";
import Show from "./components/Show/Show";
import FillBlank from "./components/FillBlank/FillBlank";
import MultipleChoice from "./components/MultipleChoice/MultipleChoice";
import Bulk from "./components/MultipleChoice/Bulk/Bulk";
import "iframe-resizer/js/iframeResizer.contentWindow"; // add this
import Footer from "./components/Footer/Footer";
// import EditQuestion from "./components/Question/EditQuestion/EditQuestion";
import Test from "./pages/Test/Test";
import ExcelFile from "./components/ExcelFile/ExcelFile";
import MultipleChoiceForm from "./pages/MultipleChoiceForm/MultipleChoiceForm";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import Home from "./pages/Home/Home";
import AddQuestion from "./pages/AddQuestion/AddQuestion";
import TrueFalseForm from "./pages/TrueFalseForm/TrueFalseForm";
import FillInTheBlankForm from "./pages/FillInTheBlankForm/FillInTheBlankForm";
import EditQuestion from "./pages/EditQuestion/EditQuestion";
import DragTheWords from "./pages/DragTheWords/DragTheWords";
import EditObject from "./pages/EditObject/EditObject";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Navbar />
          <ToastContainer />
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/true-false" Component={TrueFalse} />
            <Route path="/fill-blank" Component={FillBlank} />
            <Route path="/multiple-choice" Component={MultipleChoice} />
            <Route path="/show/:id" Component={Show} />
            <Route path="/bulk" Component={Bulk} />
            <Route path="/add-question" Component={AddQuestion} />
            <Route
              path="/add-question/multiple-choice/manual"
              Component={MultipleChoiceForm}
            />
            <Route
              path="/add-question/true-false/manual"
              Component={TrueFalseForm}
            />
            <Route
              path="/add-question/fill-in-the-blank/manual"
              Component={FillInTheBlankForm}
            />
            <Route path="/dragthewords" Component={DragTheWords} />
            {/* <Route path="/edit/:id" Component={EditQuestion} /> */}
            <Route path="/edit/:id" Component={EditObject} />
            <Route path="/edit-question/:id" Component={MultipleChoiceForm} />
            <Route path="/excel-file" Component={ExcelFile} />
            <Route path="/test" Component={Test} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
