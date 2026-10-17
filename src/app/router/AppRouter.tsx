import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ProtectedRoute from "@/app/router/ProtectedRoute";
import InventoryItemsPage from "@/features/inventory/pages/InventoryItemsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="inventory/items" element={<InventoryItemsPage />} />
            <Route path="inventory/categories" element={<PlaceholderPage />} />
            <Route path="inventory/warehouses" element={<PlaceholderPage />} />
            <Route
              path="inventory/stock-movements"
              element={<PlaceholderPage />}
            />

            <Route path="requisitions" element={<PlaceholderPage />} />
            <Route path="deliveries" element={<PlaceholderPage />} />
            <Route path="reports" element={<PlaceholderPage />} />
            <Route path="settings" element={<PlaceholderPage />} />

            <Route path="*" element={<PlaceholderPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
