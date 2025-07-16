import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Footer from "@/components/footer";
import Home from "@/pages/new-home";
import OldHome from "@/pages/home";
import PropertyDetail from "@/pages/property-detail";
import Favorites from "@/pages/favorites";
import Trash from "@/pages/trash";
import AdminComments from "@/pages/admin-comments";
import VerifyEmail from "@/pages/verify-email";
import SignupPage from "@/pages/signup";
import MyInquiries from "@/pages/my-inquiries";
import NotFound from "@/pages/not-found";
import AdminIconPreview from "@/components/admin-icon-preview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/all-properties" component={OldHome} />
      <Route path="/properties" component={OldHome} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/my-inquiries" component={MyInquiries} />

      <Route path="/trash" component={Trash} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin-icons" component={AdminIconPreview} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <TranslationProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <div className="flex-1">
                <Router />
              </div>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </TranslationProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;
