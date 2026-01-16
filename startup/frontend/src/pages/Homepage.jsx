import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../components/Home";
import AboutSection from "../components/AboutSection";

const Home = ({ isAuth }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <>
      <HeroSection isAuth={isAuth} />
      <AboutSection />
    </>
  );
};

export default Home;
