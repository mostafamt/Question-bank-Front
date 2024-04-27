import React from "react";
import ErrorBoundary from "../../components/ErrorBoundary/ErrorBoundary";

import styles from "./test.module.scss";

function MyComponent() {
  // Simulate an error for demonstration purposes
  if (Math.random() > 0.5) {
    throw new Error("An error occurred in MyComponent");
  }

  // Component logic here
  return <div>This is MyComponent</div>;
}

const Test = () => {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
};

export default Test;
