import React, { useState } from 'react'
import {  useNavigate,Link } from 'react-router-dom'
import './Signup.css'
import './Login.css'
import Backgroundvideo from '../images/background1.mp4'
const Login = (props) => {

    const [credentials, setCredentials] = useState({email: "", password: ""})
    let navigate = useNavigate();
    const handleSubmit= async (e)=>{
        e.preventDefault()
        const success = true; // Assume login was successful
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method : 'POST',
            headers: {
                'Content-Type' : 'application/json' ,
            },
            body: JSON.stringify({email : credentials.email, password: credentials.password})  //sends values from frontend JS to backend by converting them into JSON object
        });
        const json =  await response.json()
        console.log(json)
        if (json.success){
            props.onLogin()
            //Save the token and redirect
            localStorage.setItem('token', json.authToken);
            props.showAlert("Logged in Successfully", "success")
            navigate('/')
        }else{
            props.showAlert("Invalid Credentials", "danger")
        }
    }

    const onChange = (e) =>{
        setCredentials({...credentials, [e.target.name]: e.target.value})
    }

    return (
        <>
        <div className="video-background">
            <video autoPlay muted loop id="background-video">
                <source src={Backgroundvideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
        <div className="login-container">
            <h1 className="login-heading" style={{fontFamily: 'Orbitron'}}>FaceRecs</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-input"
                        id="email"
                        name="email"
                        onChange={onChange}
                        value={credentials.email}
                        aria-describedby="emailHelp"
                    />
                    <small id="emailHelp" className="form-text">We'll never share your email with anyone else.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        id="password"
                        name="password"
                        onChange={onChange}
                        value={credentials.password}
                    />
                </div>
                <button type="submit" className="btn">Login</button>
            </form>
            <p className="signup-text">
                Don't have an account? <Link to="/signup" className="signup-link">Signup</Link>
            </p>
        </div>
    </>
        
    )
}

export default Login