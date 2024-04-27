import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center mt-4">
          <h1>Something went wrong.</h1>
          <Link to="/">Go Back Home</Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
