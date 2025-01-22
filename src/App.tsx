import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ClientDashboard from "@/pages/ClientDashboard";
import InfluencerDashboard from "@/pages/InfluencerDashboard";
import SubmissionReviews from "@/pages/SubmissionReviews";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider
          router={createBrowserRouter([
            {
              path: "/",
              element: <Index />,
            },
            {
              path: "/login",
              element: <Login />,
            },
            {
              path: "/signup",
              element: <SignUp />,
            },
            {
              path: "/client",
              element: (
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              ),
            },
            {
              path: "/influencer",
              element: (
                <ProtectedRoute>
                  <InfluencerDashboard />
                </ProtectedRoute>
              ),
            },
            {
              path: "/submissions",
              element: (
                <ProtectedRoute>
                  <SubmissionReviews />
                </ProtectedRoute>
              ),
            },
          ])}
        />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
