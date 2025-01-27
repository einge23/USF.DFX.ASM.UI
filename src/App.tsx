import { HashRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { AuthProvider } from "./context/authContext";
import { HomePage } from "./pages/HomePage/HomePage";
import { AdminRoute } from "./pages/AdminPage/AdminRoute";
import { AdminPage } from "./pages/AdminPage/AdminPage";
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <HashRouter>
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
                </HashRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
