import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import { InstagramCallback } from "@/components/instagram/InstagramCallback";
import InfluencerDashboard from "@/pages/InfluencerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/influencer" element={<InfluencerDashboard />} />
        <Route path="/instagram/callback" element={<InstagramCallback />} />
      </Routes>
    </Router>
  );
}

export default App;