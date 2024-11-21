import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import Backgroundvideo from '../images/background1.mp4' // Ensure the video is correctly imported

const Signup = (props) => {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all fields are filled
    if (!credentials.name || !credentials.email || !credentials.password || !credentials.cpassword) {
      props.showAlert("All fields are required", "danger");
      return;
    }

    // Check if passwords match
    if (credentials.password !== credentials.cpassword) {
      return alert("Passwords do not match!");
    }

    // Make API request
    const response = await fetch("http://localhost:5000/api/auth/createuser", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json();

    if (json.success) {
      // Save the auth token and redirect
      localStorage.setItem('token', json.authToken);
      navigate('/');
      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert("Invalid Details!!", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="video-background">
        <video autoPlay muted loop id="background-video">
          <source src={Backgroundvideo} type="video/mp4" />
          Your browser does not support the video tag
        </video>
      </div>
      <div className="container mt-3 card">
        <h1>Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              onChange={onChange}
              value={credentials.name}
              aria-describedby="emailHelp"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              onChange={onChange}
              value={credentials.email}
              aria-describedby="emailHelp"
            />
            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={onChange}
              value={credentials.password}
              id="password"
              required
              minLength={5}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              name="cpassword"
              onChange={onChange}
              value={credentials.cpassword}
              id="cpassword"
              required
              minLength={5}
            />
          </div>
          <button type="submit" className="btn btn-primary d-flex align-items-center justify-content-center">
            Signup
          </button>
        </form>
        <div style={{ textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
