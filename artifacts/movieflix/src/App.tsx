import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { MyListProvider } from "@/context/MyListContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import MovieDetail from "@/pages/MovieDetail";
import Browse from "@/pages/Browse";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/browse">
        <ProtectedRoute>
          <Browse />
        </ProtectedRoute>
      </Route>
      <Route path="/movie/:id">
        <ProtectedRoute>
          <MovieDetail />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MyListProvider>
            <div className="dark min-h-screen bg-background text-foreground">
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </div>
          </MyListProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
