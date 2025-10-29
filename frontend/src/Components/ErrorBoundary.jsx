import React from "react";
import Swal from "sweetalert2";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  
componentDidCatch(error, errorInfo) {
    console.error("Error Boundary Caught:", error, errorInfo);

    // Show SweetAlert2 popup
    Swal.fire({
      icon: "error",
      title: "Oops! Something went wrong 😢",
      text: error?.message || "An unexpected error occurred.",
      confirmButtonText: "Reload Page",
    }).then(() => {
      // Optional: reload the app after alert
      window.location.reload();
    });
  }
  render() {
    if (this.state.hasError) {
      // Render fallback UI (in case SweetAlert2 fails for some reason)
      return (
        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
