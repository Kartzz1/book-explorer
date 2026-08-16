import React from "react";
import { RefreshCcw } from "lucide-react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (!hasError) {
      return children;
    }

    return (
      <main className="page-shell">
        <div className="container-fluid spatial-container">
          <section
            className="state-panel"
            role="alert"
            aria-live="assertive"
          >
            <span className="state-kicker">
              Unexpected issue
            </span>

            <h1>Book Explorer needs a fresh start.</h1>

            <p>
              The page ran into an unexpected problem. Your saved
              favorites remain safely stored in your browser.
            </p>

            <button
              type="button"
              className="secondary-action button-reset"
              onClick={this.handleReload}
            >
              <RefreshCcw
                size={16}
                aria-hidden="true"
              />
              <span>Reload Book Explorer</span>
            </button>
          </section>
        </div>
      </main>
    );
  }
}


