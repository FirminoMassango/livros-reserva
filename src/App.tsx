import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import BookDetails from "./pages/BookDetails";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { SellerBuyingView } from "./components/SellerBuyingView";
import Vendedor from "./pages/Vendedor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/livro/:id" element={<BookDetails />} />
              <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/vendedor" element={<Vendedor />} />
            <Route path="/buy/:id" element={<SellerBuyingView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    <div className="text-center my-2">
      <span className="text-sm text-slate-700">© {new Date().getFullYear()} CrossCode</span>
    </div>
  </QueryClientProvider>
);

export default App;
