import React, { useEffect } from "react";
import "../css/Home.css";

const Home = () => {
  useEffect(() => {
    document.body.classList.add("home-page");
    return () => document.body.classList.remove("home-page");
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="home-container">
        <div className="overlay"></div>
        <div className="content">
          <h1 className="fade-in">GEARGRID</h1>
          <h2 className="fade-in">THE ONLY CAR EVENT PLATFORM YOU’LL EVER NEED</h2>
          <p className="fade-in">THE FUTURE OF CAR EVENTS & COMMUNITY</p>
          <p className="fade-in last-line">—BUILT FOR ENTHUSIASTS, BY ENTHUSIASTS.</p>
        </div>
      </div>

      {/* Scrollable Sections */}
      <div className="section-scroll-container">
        {/* Section 1: Our Mission */}
        <section className="scroll-section scroll-video-full">
          <video
            src="/videos/SpedHomevid.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="scroll-full-video"
          />
          <div className="scroll-overlay-text glass-box">
            <h2>OUR MISSION</h2>
            <p>
              GearGrid exists to <strong>amplify the spirit of automotive culture</strong> — not just through tools,
              but through meaningful connection. We believe cars are more than machines; they’re reflections of identity, passion, and innovation.
            </p>
            <p style={{ marginTop: "15px" }}>
              Our goal is to bring together enthusiasts of all kinds — builders, collectors, racers, tuners, and dreamers — into a vibrant digital community where stories are told, creativity thrives, and experiences are unforgettable.
            </p>
            <p style={{ marginTop: "15px" }}>
              Whether you’re launching your first event, revealing a new build, or discovering a garage across the country, GearGrid is the <strong>platform that fuels it all</strong>.
            </p>
          </div>
        </section>

        {/* Section 2: Features */}
        <section id="about-section" className="scroll-section scroll-video-full">
          <video
            src="/videos/Homevid.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="scroll-full-video"
          />
          <div className="scroll-overlay-text glass-box">
            <h2>Everything You Need to Elevate Your Passion</h2>
            <p>
              No matter who you are — a builder, event host, or custom ride enthusiast — GearGrid is your space.
              Share your builds, find exclusive car meets, and connect with trusted automotive businesses.
            </p>
            <p style={{ marginTop: "15px" }}>
              This isn’t just a platform — it’s where your passion becomes community.
            </p>
          </div>
        </section>

        {/* Section 3: Get Involved (New Video Background) */}
        <section className="scroll-section scroll-video-full get-involved-section">
          <video
            src="/videos/CarDrifting.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="scroll-full-video"
          />
          <div className="scroll-overlay-text glass-box">
            <h2>Get Involved</h2>
            <p>Join the movement. Share your story. Fuel the culture.</p>
            <p style={{ marginTop: "15px" }}>
              Whether you're showcasing a new build, planning a local car meet, or vibing with fellow gearheads — <strong>GearGrid is your lane</strong>. Here, your passion powers the feed.
            </p>
            <p style={{ marginTop: "15px" }}>
              Build your digital garage. Grow your following. Inspire others. Discover new events, garages, and mods that match your vision. This isn’t just a site — <strong>it’s your stage</strong>.
            </p>
            <p style={{ marginTop: "15px" }}>
              Don’t just follow the scene — <strong>drive it</strong>. Post. Host. Explore. Connect.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;