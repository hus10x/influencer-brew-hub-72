import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { InfluencerDashboard } from "@/pages/InfluencerDashboard";
import { InstagramCallback } from "@/components/instagram/InstagramCallback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/influencer" element={<InfluencerDashboard />} />
        <Route path="/instagram/callback" element={<InstagramCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
