import React from "react";
import List from "./components/List/List";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import TrueFalse from "./components/TrueFalse/TrueFalse";
import Navbar from "./components/Navbar/Navbar";
import Show from "./components/Show/Show";
import FillBlank from "./components/FillBlank/FillBlank";
import reducers from "./store/reducers";
import { createStore } from "@reduxjs/toolkit";
import MultipleChoice from "./components/MultipleChoice/MultipleChoice";
import Bulk from "./components/MultipleChoice/Bulk/Bulk";
import "iframe-resizer/js/iframeResizer.contentWindow"; // add this
import Footer from "./components/Footer/Footer";
import AddQuestion from "./components/Question/AddQuestion/AddQuestion";
import EditQuestion from "./components/Question/EditQuestion/EditQuestion";

function App() {
  const store = createStore(reducers);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div
          style={{ height: "100vh", display: "flex", flexDirection: "column" }}
        >
          <Navbar />
          <Routes>
            <Route path="/" Component={List} />
            <Route path="/true-false" Component={TrueFalse} />
            <Route path="/fill-blank" Component={FillBlank} />
            <Route path="/multiple-choice" Component={MultipleChoice} />
            <Route path="/show/:id" Component={Show} />
            <Route path="/bulk" Component={Bulk} />
            <Route path="/add-question" Component={AddQuestion} />
            <Route path="/edit-question" Component={EditQuestion} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
