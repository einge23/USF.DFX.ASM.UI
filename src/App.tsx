import { HashRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/authContext";
import { HomePage } from "./pages/HomePage/HomePage";
const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/Home" element={<HomePage />} />
                    </Routes>
                </HashRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
