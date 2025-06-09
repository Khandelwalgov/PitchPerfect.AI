import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AppPage from './components/AppPage';
import Login from './components/login';
import Signup from './components/signup';
import IndexPage from './components/index';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  </Router>
);

export default App;
