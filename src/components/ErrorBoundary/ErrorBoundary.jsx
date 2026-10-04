import React from "react";

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center mt-4">
          <h1>Something went wrong.</h1>
          <a href="/">Go Back Home</a>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
