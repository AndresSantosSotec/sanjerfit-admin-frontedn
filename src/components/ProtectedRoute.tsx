import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("auth_token");
  const userJson = localStorage.getItem("auth_user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    if (userJson) {
      const user = JSON.parse(userJson);
      const adminRoles = ["Administrador", "Editor", "Visualizador"];
      
      // Si el rol es nulo o no pertenece a los roles administrativos permitidos, bloquear acceso
      if (!user || !user.role || !adminRoles.includes(user.role.name)) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("last_activity_ts");
        return <Navigate to="/login" replace />;
      }
    } else {
      // Si hay token pero no hay objeto de usuario, limpiar por seguridad
      localStorage.removeItem("auth_token");
      localStorage.removeItem("last_activity_ts");
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    // Si el JSON de localStorage es corrupto o inválido, limpiar e ir a login
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("last_activity_ts");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
