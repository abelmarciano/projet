import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalBackground from "@/components/GlobalBackground";
import { GradientDefs } from "@/components/ui/gradient-icon";
import Index from "./pages/Index";

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <GradientDefs />
      <GlobalBackground />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
