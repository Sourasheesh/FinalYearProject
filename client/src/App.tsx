import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAuthToken, getUserRole } from "./lib/auth";
import NotFound from "@/pages/not-found";

import Login from "./pages/login";
import Signup from "./pages/signup";
import VerifyOtp from "./pages/verify-otp";
import UserDashboard from "./pages/user-dashboard";
import AdminDashboard from "./pages/admin-dashboard";

// Protected Route wrapper ensuring the user is logged in
const ProtectedRoute = ({ component: Component, allowedRole }: { component: React.ComponentType, allowedRole?: string }) => {
  const token = getAuthToken();
  const role = getUserRole();

  if (!token) return <Redirect to="/login" />;
  if (allowedRole && role !== allowedRole) return <Redirect to="/login" />;

  return <Component />;
};

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => {
          const token = getAuthToken();
          const role = getUserRole();
          if (token) {
            return <Redirect to={role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} />;
          }
          return <Redirect to="/login" />;
        }}
      </Route>

      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-otp" component={VerifyOtp} />
      
      <Route path="/user-dashboard">
        {() => <ProtectedRoute component={UserDashboard} allowedRole="user" />}
      </Route>
      
      <Route path="/admin-dashboard">
        {() => <ProtectedRoute component={AdminDashboard} allowedRole="admin" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
