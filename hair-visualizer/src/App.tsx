import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Visualizer from "./components/Visualizer";

export default function App() {
  return (
    <div className="bg-[#f5f3ed] text-black min-h-screen font-sans antialiased">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/visualizer" element={<Visualizer />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
