import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import PanasonicLogo from "../assets/Panasonic.png";

const phrases = [
  { text: "Welcome to PitchPerfect.AI", color: "#00B0F0" },
  { text: "Welcome to PitchPerfect.AI", color: "#00FFAA" },
  { text: "Welcome to PitchPerfect.AI", color: "#FFD700" },
];

export default function IndexPage() {
  const navigate = useNavigate();
  const textRef = useRef(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex].text;
    const color = phrases[currentPhraseIndex].color;

    const updateText = () => {
      setDisplayedText((prev) => {
        if (!isDeleting) {
          const next = phrase.substring(0, prev.length + 1);
          return next;
        } else {
          const next = phrase.substring(0, prev.length - 1);
          return next;
        }
      });

      if (!isDeleting && displayedText === phrase) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    const timer = setTimeout(updateText, isDeleting ? 50 : 120);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  return (
    <div className="landing-root">
      <nav className="navbar">
        <div className="navbar-left">
          <img src={PanasonicLogo} alt="Panasonic" className="navbar-logo" />
        </div>
        <span className="navbar-title">PitchPerfect.AI</span>
      </nav>

      <div className="index-page">
        <h1
          className="animated-title"
          style={{ color: phrases[currentPhraseIndex].color }}
          ref={textRef}
        >
          {displayedText}
        </h1>
        <p className="description-text">
          Revolutionizing how Panasonic FIS present, practice, perform,
          and perfect their pitch with AI-powered evaluation.
        </p>
        <div className="button-group">
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Signup</button>
        </div>
      </div>
    </div>
  );
}
