import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanasonicLogo from "../assets/Panasonic.png"; // Ensure this path is correct
import productScripts from '../../../product_scripts.json';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  Typography,
  Box,
  Container,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';
import './LandingPage.css'; // Add animation here

const LandingPage = () => {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState('MX850 LED');
  const navigate = useNavigate();

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };
  const handleSubmit = async () => {
    await fetch('http://localhost:5000/submit-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
      credentials: "include" 
    });
    navigate('/app');
  };

  return (
    <Box className="landing-root">
     
      <nav className="navbar">
                  <div className="navbar-left">
                    <img src={PanasonicLogo} alt="Panasonic" className="navbar-logo" />
                    
                  </div>
                  <span className="navbar-title">PitchPerfect.AI</span>
              {/* <button onClick={() => navigate("/Landing")} className="choose-link">
                Choose another product
              </button> */}
              <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
            </nav>
      <Container maxWidth="sm" className="landing-container">
        <Paper elevation={8} className="landing-card">
          <Typography className="typing-text">
            Choose your product
          </Typography>
          {/* <Select
            fullWidth
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="RAC">RAC</MenuItem> 
            <MenuItem value="Refrigerator">Refrigerator</MenuItem>
            <MenuItem value="Washing Machine">Washing Machine</MenuItem>
            <MenuItem value="LED">LED</MenuItem>
          </Select> */}
          <Select
          fullWidth
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          sx={{ mb: 2 }}
        >
          {Object.keys(productScripts).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>

          <Button
            variant="contained"
            onClick={handleClickOpen}
            sx={{
              background: 'linear-gradient(45deg, #007AC2 30%, #00B0FF 90%)',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
            }}
          >
            Test
          </Button>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Confirm Product</DialogTitle>
            <DialogContent>
              <Typography>You selected: {product}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: '#007AC2' }}>
                Continue
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
