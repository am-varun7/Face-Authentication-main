import React, { useState } from 'react';
import individualImage from '../images/single.png';
import GroupImage from '../images/group.png';
import CrowdImage from '../images/crowd.png';
import { Link, useNavigate } from "react-router-dom";
import './Dashboard.css';
import { FaUserCircle } from "react-icons/fa";

const Dashboard = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    

    const handleLogout = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    const handleLearnMore = () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    };

   
    const [selectedModel, setSelectedModel] = useState(""); // To track the selected model

  const handleModelSelection = (model) => {
    setSelectedModel(model);
  };

  const handleBack = () => {
    setSelectedModel(""); // Reset to show the model selection options
  };

    return (
        <>
            <div className="bacground_dashboard">
                <div className="BGhome" id="home">
                    <nav className="navbar">
                        <div className="navbar-left">
                            <h1 style={{ fontFamily: 'Orbitron' }}>FaceRecs</h1>
                        </div>
                        <div className={`navbar-middle ${isMenuOpen ? 'open' : ''}`}>
                            <ul className="nav-links">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#about">About</a></li>
                            </ul>
                        </div>
                        <div className='profile_logout'>
                        <Link to="/userprofile" style={{ textDecoration: "none", marginRight: "10px" }}>
                                    <FaUserCircle size={50} color="teal"  />
                            </Link>
                            <div className="navbar-right logout-desktop">
                            <button className="logout-button" onClick={handleLogout}>Log out</button>
                            </div>
                        </div>
                        <div className="hamburger" onClick={toggleMenu}>
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                        </div>
                    </nav>
                    {isMenuOpen && (
                        <div className="mobile-menu">
                            <ul className="mobile-nav-links">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#about">About</a></li>
                                <li><button className="logout-button" onClick={handleLogout}>Log out</button></li>
                            </ul>
                        </div>
                    )}
                    <div className="home_hero_section">
                        <h1>Live Face Authentication</h1>
                        <p className="hero-description">
                            Experience the future of Face Recognition and Authentication with real-time face recognition technology. Secure and accurate, designed for individuals, groups, and large gatherings.
                        </p>
                        <div className="cta-buttons">
                            <button className="home-button" onClick={handleLearnMore}>Learn More</button>
                        </div>
                    </div>
                </div>
                 {/* Features Section */}
                 {/* Features Section */}
<div className="features" id="features">
    {/* Feature Cards */}
    <div className="feature-card">
        <img src={individualImage} alt="Individual Face" />
        <h5>Individual Face Authentication</h5>
        <p>Securely authenticate individual users with advanced facial recognition technology.</p>
        
        <div className="button-group">
            {/* Render model selection buttons if no model is selected */}
            {selectedModel === "" && (
            <>
                <button
                className="btn btn-primary m-2"
                onClick={() => handleModelSelection("pretrained")}
                >
                Use Pretrained Model
                </button>
                <button
                className="btn btn-primary m-2"
                onClick={() => {
                    alert("Warning!\nThe accuracy of this model is 75% ,for better accuracy use pre-trained model .");
                    handleModelSelection("cnn");
                    }
                }
                >
                Use Custom CNN Model
                </button>
            </>
            )}

            {/* Render Pretrained Model options */}
            {selectedModel === "pretrained" && (
            <>
                <Link to="/individualregistration">
                    <button className="btn btn-primary m-2">
                        Register
                    </button>
                </Link>
                <Link to="/individualauthentication">
                    <button className="btn btn-secondary m-2">
                        Verify
                    </button>
                </Link>
                <button className="btn btn-danger m-2" onClick={handleBack}>
                    Back
                </button>
            </>
            )}

            {/* Render Custom CNN Model options */}
            {selectedModel === "cnn" && (
            <>
                <Link to="/individualregistrationcnn">
                    <button className="btn btn-primary m-2">
                        Register using custom model
                    </button>
                </Link>
                <Link to="/individualauthenticationcnn">
                    <button className="btn btn-secondary m-2">
                        Verify using custom model
                    </button>
                </Link>
                <button className="btn btn-danger m-2" onClick={handleBack}>
                    Back
                </button>
            </>
            )}
        </div>
    </div>

    <div className="feature-card">
        <img src={GroupImage} alt="Group Authentication" />
        <h5>Group Authentication</h5>
        <p>Authenticate multiple users simultaneously in a single image with precision.</p>
        <div className="button-group">
            <Link to="/groupauthentication">
                <button className="btn btn-secondary">Verify mtcnn</button>
            </Link>
        </div>
    </div>

    <div className="feature-card">
        <img src={CrowdImage} alt="Crowd Analysis" />
        <h5>Crowd Analysis</h5>
        <p>Analyze and count faces in dense crowds with cutting-edge detection algorithms.</p>
        <div className="button-group">
            {/* Button for image redirection */}
            <Link to="/crowdimage">
                <button className="btn btn-primary">Image</button>
            </Link>
            
            {/* Button for video redirection */}
            <Link to="/crowd">
                <button className="btn btn-primary">Video</button>
            </Link>
        </div>
    </div>
</div>


                {/* About Section */}
                <div className="about-section" id="about">
                    <h2>About Our Features</h2>
                    <p>
                        Discover how our advanced deep learning solutions bring innovation to face recognition,
                        ensuring security, accuracy, and scalability across various applications.
                    </p>
                    <div className="about-cards-container">
                        <div className="about-card">
                            <div className="about-card-icon">👤</div>
                            <h3>Individual Authentication</h3>
                            <p>
                                Securely recognize and authenticate individuals using CNN-based deep learning.
                                Handles variations in lighting, expressions, and angles for reliable access control.
                            </p>
                        </div>
                        <div className="about-card">
                            <div className="about-card-icon">👥</div>
                            <h3>Group Authentication</h3>
                            <p>
                                Use MTCNN and pre-trained models like FaceNet to identify and verify small groups.
                                Ideal for attendance tracking and secure group access.
                            </p>
                        </div>
                        <div className="about-card">
                            <div className="about-card-icon">📊</div>
                            <h3>Crowd Counting</h3>
                            <p>
                                Leverage YOLO and MCNN models for real-time face detection in high-density crowds.
                                Supports safety monitoring and statistical crowd analysis.
                            </p>
                        </div>
                    </div>
                </div>

                <footer>
                    <p>Copyright © 2024 Design.com. All Rights Reserved.</p>
                </footer>
            </div>
            
        </>
    );
};

export default Dashboard;
