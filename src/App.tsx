import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { AuthProvider } from "./context/authContext";
import { HomePage } from "./pages/HomePage/HomePage";
import { AdminRoute } from "./pages/AdminPage/AdminRoute";
import { AdminPage } from "./pages/AdminPage/AdminPage";
import { Toaster } from "sonner";
import { IdleTimerProvider } from "./contexts/IdleTimerContext";
import { IdleWarningModal } from "./components/common/IdleWarningModal";
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Toaster />
                <BrowserRouter>
                    <IdleTimerProvider>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/Home" element={<HomePage />} />
                            <Route
                                path="/Admin"
                                element={
                                    <AdminRoute>
                                        <AdminPage />
                                    </AdminRoute>
                                }
                            />
                        </Routes>
                        <IdleWarningModal />
                    </IdleTimerProvider>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
