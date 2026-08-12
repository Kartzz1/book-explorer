import React from "react";
import { RefreshCcw } from "lucide-react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="page-shell">
        <div className="container-fluid spatial-container">
          <section className="state-panel" role="alert">
            <span className="state-kicker">Unexpected issue</span>
            <h1>Book Explorer needs a fresh start.</h1>
            <p>The page hit an unexpected problem. Your saved favorites remain in your browser.</p>
            <button type="button" className="secondary-action button-reset" onClick={this.handleReload}>
              <RefreshCcw size={16} /> Reload Book Explorer
            </button>
          </section>
        </div>
      </main>
    );
  }
}
