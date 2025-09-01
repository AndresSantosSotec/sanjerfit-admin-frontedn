
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserRegistration from "./pages/UserRegistration";
import ManageUsers from "./pages/ManageUsers";
import Notifications from "./pages/Notifications";
import PrizeDelivery from "./pages/PrizeDelivery";
import InventoryManagement from "./pages/InventoryManagement";
import PremiosPage from "./pages/Premios";
import GeneralInfoPage from "./pages/GeneralInfo";
import Reports from "./pages/Reports";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/webadmin">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="premios" element={<PremiosPage />} />
            <Route path="usuarios/registrar" element={<UserRegistration />} />
            <Route path="usuarios/gestionar" element={<ManageUsers />} /> {/* New route */}
            <Route path="usuarios/notificaciones" element={<Notifications />} />
            <Route path="premios/entregar" element={<PrizeDelivery />} />
            <Route path="premios/inventario" element={<InventoryManagement />} />
          <Route path="informacion-general" element={<GeneralInfoPage />} />
          <Route path="reportes" element={<Reports />} />
            <Route path="reportes/actividades" element={<Reports />} />
            <Route path="reportes/departamentos" element={<Reports />} />
            <Route path="seguridad" element={<Security />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
