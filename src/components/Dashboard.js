import React from 'react';
import individualImage from '../images/single.png';
import GroupImage from '../images/group.png';
import CrowdImage from '../images/crowd.png';
import { useNavigate , Link} from 'react-router-dom';
import face from '../images/face12.jpg';
import group from '../images/group12.jpg';
import crowd from '../images/crowd12.png';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLearnMore = () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    };

    const handleIndiRegister = () => {
        navigate('/individualregistration');
    };

    const handleIndiAuth = () => {
        navigate('/individualauthentication');
    };

    
    const handlelogout = (e) => {
        e.preventDefault();
        navigate('/login');
    }

    return (
        <>
            <div className='BGhome' id='home'>
                <nav>
                    <div className="nav_bar">
                        <h1>Face Detection</h1>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                        <Link className="Logout-button" onClick={handlelogout}>Log out</Link>
                    </div>
                </nav>
                <div className='home_hero_section'>
                    <h1>Live Face Authentication</h1>
                    <p className='hero-description'>
                        Experience the future of authentication with real-time face recognition technology. Secure and accurate, designed for individuals, groups, and large gatherings.
                    </p>
                    <div className='cta-buttons'>
                        <button className='home-button' onClick={handleLearnMore}>Learn More</button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className='features' id='features'>
                {/* Individual Face Authentication Card */}
                <div className="feature-card">
                    <img src={individualImage} alt="Individual Face" />
                    <h5>Individual Face Authentication</h5>
                    <div className="button-group">
                        <button className="btn btn-primary" onClick={handleIndiRegister}>Register</button>
                        <button className="btn btn-secondary" onClick={handleIndiAuth}>Verify</button>
                    </div>
                </div>

                {/* Group Authentication Card */}
                <div className="feature-card">
                    <img src={GroupImage} alt="Group Authentication" />
                    <h5>Group Authentication</h5>
                    <div className="button-group">
                        <button className="btn btn-primary">Register</button>
                        <button className="btn btn-secondary">Verify</button>
                    </div>
                </div>

                {/* Crowd Analysis Card */}
                <div className="feature-card">
                    <img src={CrowdImage} alt="Crowd Analysis" />
                    <h5>Crowd Analysis</h5>
                    <button className="btn btn-primary">Start</button>
                </div>
            </div>

            {/* About Section */}
            <div className='About_section' id='about'>
                <h1>About</h1>
                <div className='image-section'>
                    <div className='image-box'>
                        <img src={face} alt="Face Authentication" />
                        <p>Our facial recognition authentication system uses deep learning to capture and store multiple images of individuals, handling variations in expressions, lighting, and angles. A Convolutional Neural Network (CNN) is implemented for accurate face recognition, with images securely stored in MongoDB. Integrated into a MERN stack, this solution ensures reliable and secure authentication.</p>
                    </div>
                    <div className='image-box'>
                        <img src={group} alt="Group Authentication" />
                        <p>Our group authentication system leverages deep learning to identify and authenticate multiple individuals in a single image. Using MTCNN for face detection and a pre-trained model like FaceNet or ArcFace for feature extraction, it stores extracted features in MongoDB. Integrated within a MERN stack, this solution enables secure, accurate verification and attendance tracking for small to medium-sized gatherings.</p>
                    </div>
                    <div className='image-box'>
                        <img src={crowd} alt="Crowd Analysis" />
                        <p>Our large gathering face counting system uses deep learning to accurately count faces in high-density crowds. By integrating advanced face detection algorithms like YOLO for real-time detection and MCNN for high-density crowd counting, the system ensures precise face counts. Built within a MERN stack application, it supports crowd management, safety monitoring, and provides valuable statistical data on crowd sizes in real-time.</p>
                    </div>
                </div>
            </div>

            <footer>
                <p>Copyright © 2024 Design.com. All Rights Reserved.</p>
            </footer>
        </>
    );
};

export default Dashboard;
