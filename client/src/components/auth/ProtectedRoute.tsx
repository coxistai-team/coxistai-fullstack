import { useAuth } from "@/contexts/AuthContext";
import { ComponentType } from "react";

interface ProtectedRouteProps {
  component: ComponentType;
  previewComponent: ComponentType;
}

const ProtectedRoute = ({ component: Component, previewComponent: PreviewComponent }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PreviewComponent />;
  }

  return <Component />;
};

export default ProtectedRoute;