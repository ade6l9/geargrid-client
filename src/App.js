import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import Archive from "./components/Archive";
import Events from "./components/Events";
import OrganizeEvent from './components/OrganizeEvent';
import Footer from './components/Footer';
import Header from "./components/Header";
import Contact from "./components/Contact";
import Businesses from "./components/Businesses";
import BusinessDetail from "./components/BusinessDetail";
import CarBuild from "./components/CarBuild";
import EditBuild from "./components/Editbuild"; 
import AddBuild from "./components/Addbuild";
import RegisterEvent from "./components/RegisterEvent";
import EditProfile from "./components/EditProfile";
import AddBusiness from './components/AddBusiness';
import '@fortawesome/fontawesome-free/css/all.min.css';

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      <Header />
      
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/menu" element={<Navbar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:viewedUserId" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/events" element={<Events />} />
          <Route path="/organize-event" element={<OrganizeEvent />} />
          <Route path="/register" element={<RegisterEvent />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/businesses/:name" element={<BusinessDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/car-build/:id" element={<CarBuild />} />
          <Route path="/edit-build/:id" element={<EditBuild />} />
          <Route path="/add-build" element={<AddBuild />} />
          <Route path="/add-business" element={<AddBusiness />} />
        </Routes>
      </main>

      {/* Footer only on home page */}
      {(location.pathname === "/" || location.pathname === "/home") && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
