import React from "react";
import { Navigate } from "react-router-dom";
import { canAccessLogin } from "../utils/gateGuard";

/**
 * Wraps protected content (e.g. Login).
 * Redirects to /gate if gate conditions are not met.
 */
const GateGuard = ({ children, isAuthenticating = false }) => {
  // If we're still checking authentication, render children to avoid redirect loop
  if (isAuthenticating) {
    return children;
  }
  
  if (!canAccessLogin()) {
    return <Navigate to="/gate" replace />;
  }
  return children;
};

export default GateGuard;
