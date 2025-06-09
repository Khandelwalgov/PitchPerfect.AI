

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AppPage.css";
import PanasonicLogo from "../assets/Panasonic.png"; // Ensure this path is correct



export default function AppPage() {
  const [recording, setRecording] = useState(false);
  const [hindiTranscript, setHindiTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("https://pitchperfect-ai.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks.current = [];
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "recording.wav");

      try {
        const res = await fetch("https://pitchperfect-ai.onrender.com/upload", {
          method: "POST",
          body: formData,
          credentials: "include" 
        });

        const data = await res.json();
        setHindiTranscript(data.transcription || "[No Hindi transcript returned]");
        setScore(data.score != null ? `${data.score}/10` : "[No score returned]");
        setReviewFeedback(data.review_feedback || "[No review feedback returned]");
      } catch (err) {
        console.error("Upload failed:", err);
        setHindiTranscript("[Error occurred during upload or processing]");
        setEnglishTranslation("");
        setReviewFeedback("");
      }
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  return (
    
    <div className="app-container">
      <nav className="navbar">
            <div className="navbar-left">
              <img src={PanasonicLogo} alt="Panasonic" className="navbar-logo" />
              
            </div>
            <span className="navbar-title">PitchPerfect.AI</span>
        <button onClick={() => navigate("/Landing")} className="choose-link">
          Choose another product
        </button>
        <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
      </nav>

      <div className="app-card">
        <div className="record-button-container">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`record-button ${recording ? "stop" : "start"}`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>

        <div className="sections">
          <Section title="Transcript" content={hindiTranscript} />
          {/* <Section title="Score" content={englishTranslation} /> */}
          {/* Score Box */}
          <div className="score-box">
            <h2 className="score-title">Score</h2>
            <div className="score-content">
              {score || "Awaiting score..."}
            </div>
          </div>
          <Section title="Review" content={reviewFeedback} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        {content || "Awaiting input..."}
      </div>
    </div>
  );
}
