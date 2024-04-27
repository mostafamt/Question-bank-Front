import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container">
      <h1>404 Error Page</h1>
      <Link to="/">Go Back Home</Link>
    </div>
  );
};

export default NotFound;
