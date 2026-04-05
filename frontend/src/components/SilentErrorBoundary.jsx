import React from "react";

/**
 * Contains errors from children so a broken modal/widget does not take down the whole app
 * (the outer ErrorBoundary renders a full-screen dark "App Crashed" UI).
 */
export default class SilentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[SilentErrorBoundary]", error, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
