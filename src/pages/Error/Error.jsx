import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div className="container text-center mt-4">
      <h1>Something went wrong.</h1>
      <Link to="/">Go Back Home</Link>
    </div>
  );
};

export default Error;
