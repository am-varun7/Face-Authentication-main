import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import './IndividualReg.css';

const IndividualReg = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [capturedFrames, setCapturedFrames] = useState([]);
    const [frameCount, setFrameCount] = useState(0);
    const [status, setStatus] = useState("");
    const [name, setName] = useState("");
    const [roll_no, setroll_no] = useState("");
    const [showQRScanner, setShowQRScanner] = useState(false);

    const startVideo = async () => {
        if (videoRef.current && videoRef.current.srcObject) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setStatus(""); // Clear status when camera starts
        } catch (error) {
            console.error("Error accessing webcam:", error);
            setStatus("Unable to access the camera. Please allow permissions.");
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const captureFrame = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/jpeg");
    };

    const handleRegister = async () => {
        if (!name || !roll_no) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsRegistering(true);
        setCapturedFrames([]);
        setStatus("Starting registration...");
        setFrameCount(0);

        let embeddings = [];
        let frameCounter = 0;

        const captureInterval = setInterval(async () => {
            // setStatus("");
            if (frameCounter < 10) {
                const frame = await captureFrame();
                if (frame) {
                    try {
                        const response = await fetch("http://localhost:5001/generate-embedding", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ frame }),
                        });

                        const data = await response.json();

                        if (data.faceDetected) {
                            embeddings.push(data.embedding);
                            setFrameCount((prev) => prev + 1);
                            setStatus(`Face detected and captured (${frameCounter + 1}/10).`);
                            frameCounter++;
                        } else {
                            setStatus("No face detected, please adjust your position.");
                        }
                    } catch (error) {
                        console.error("Error communicating with Flask backend:", error);
                        setStatus("Error processing frame.");
                    }
                }
            } else {
                clearInterval(captureInterval);
                stopVideo();
                sendEmbeddingsToBackend(embeddings);
            }
        }, 1000);
    };

    const sendEmbeddingsToBackend = async (embeddings) => {
        if (embeddings.length === 0) {
            setStatus("Failed to capture valid face data.");
            setIsRegistering(false);
            return;
        }

        const requestBody = { name, roll_no, embeddings };

        try {
            const response = await fetch("http://localhost:5000/api/face/register-face", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setStatus("Registration successful!");
            } else {
                const errorData = await response.json();
                console.error("Backend error:", errorData);
                setStatus(`Error registering face: ${errorData.message || "Unknown error."}`);
            }
        } catch (error) {
            console.error("Error sending embeddings:", error);
            setStatus("Error occurred during registration.");
        } finally {
            setIsRegistering(false);
        }
    };

    useEffect(() => {
        return () => {
            stopVideo();
        };
    }, []);

    const handleBack = () => {
        navigate("/Dashboard");
    };

    const handleQRResult = (result, error) => {
        if (result?.text) {
            const [scannedRollNo, scannedName] = result.text.split(",");
            setroll_no(scannedRollNo || "");
            setName(scannedName || "");
            setShowQRScanner(false);
            // setStatus("QR Code scanned successfully!");
        }
        if (error) {
            console.error("QR Code Scan Error:", error);
            // setStatus("Error reading QR code. Please try again.");
        }
    };

    const handleShowQRScanner = () => {
        setShowQRScanner(!showQRScanner);
        setStatus(""); // Clear status when toggling QR scanner
    };

    return (
        <div className="register-container">
            <button onClick={handleBack} className="back-button">
                &lt; Back
            </button>
            <h1 className="register-heading">Register Face</h1>
            <div className="register-card">
                <div className="register-card-body">
                    <button
                        onClick={handleShowQRScanner}
                        disabled={videoRef.current?.srcObject}
                        className="register-btn register-btn-secondary scan-qr-btn"
                    >
                        {showQRScanner ? "Close QR Scanner" : "Scan QR Code"}
                    </button>
                    {showQRScanner && (
                        <QrReader
                            onResult={handleQRResult}
                            style={{ width: "100%" }}
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter Roll_no"
                        value={roll_no}
                        onChange={(e) => setroll_no(e.target.value)}
                        disabled={isRegistering}
                        className="register-input mb-3"
                        required
                    />
                    <video ref={videoRef} className="register-video" muted />
                    <br />
                    <div className="register-buttons mt-3">
                        <button onClick={startVideo} disabled={isRegistering} className="register-btn register-btn-success">
                            Start Camera
                        </button>
                        <button onClick={stopVideo} disabled={isRegistering} className="register-btn register-btn-danger">
                            Stop Camera
                        </button>
                    </div>
                    <button onClick={handleRegister} disabled={isRegistering} className="register-btn register-btn-primary mt-3">
                        Register
                    </button>
                    <p className="register-status mt-3">Status: {status || "None"}</p>
                    <p className="register-frame-count">Captured Frames: {frameCount}/10</p>
                </div>
            </div>
        </div>
    );
};

export default IndividualReg;
