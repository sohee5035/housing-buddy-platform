import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TranslationProvider } from "@/contexts/TranslationContext";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import PropertyDetail from "@/pages/property-detail";
import Trash from "@/pages/trash";
import NotFound from "@/pages/not-found";
import AdminIconPreview from "@/components/admin-icon-preview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/trash" component={Trash} />
      <Route path="/admin-icons" component={AdminIconPreview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
