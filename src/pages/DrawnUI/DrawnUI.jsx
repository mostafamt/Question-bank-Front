import React from "react";
import { useLocation, useParams } from "react-router-dom";
import DrawnUIForm from "../../components/DrawnUI/DrawnUIForm/DrawnUIForm";

const DrawnUI = () => {
  const { type, baseType, id } = useParams();
  const { pathname } = useLocation();
  const isEditPage = pathname.startsWith("/edit-question");

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "3rem" }}>{type}</h1>
      <DrawnUIForm
        baseType={baseType}
        initialValues={null}
        objectId={isEditPage ? id : null}
      />
    </div>
  );
};

export default DrawnUI;
