import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CSS_UserProfile';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [pLabels, setPLabels] = useState([]); // Ensure default empty array
    const [cnnLabels, setCnnLabels] = useState([]); // Ensure default empty array
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    const [showEditIcon, setShowEditIcon] = useState(false);
    const [showPLabels, setShowPLabels] = useState(false);
    const [showCnnLabels, setShowCnnLabels] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { 'auth-token': token },
                });

                setUserData(response.data.user);
                setUpdatedName(response.data.user.name);
                setPLabels(response.data.pLabels || []); // Ensure non-null
                setCnnLabels(response.data.cnnLabels || []); // Ensure non-null
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdateName = async () => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                'http://localhost:5000/api/auth/profile/update-name',
                { name: updatedName },
                { headers: { 'auth-token': token } }
            );
            setUserData((prev) => ({ ...prev, name: updatedName }));
            setEditMode(false);
        } catch (error) {
            console.error('Error updating name:', error);
        }
    };

    const handleDeleteLabel = async (label, modelType) => {
        try {
            const token = sessionStorage.getItem('token');
            const url = `http://localhost:5000/api/face/delete-labels/${label}?model-type=${modelType}`;
            await axios.delete(url, { headers: { 'auth-token': token } });

            // Update the correct state based on modelType
            if (modelType === 'PTM') {
                setPLabels((prev) => prev.filter((item) => item !== label));
            } else if (modelType === 'CNN') {
                setCnnLabels((prev) => prev.filter((item) => item !== label));
            }

            console.log(`Label "${label}" deleted successfully [${modelType}].`);
        } catch (error) {
            console.error('Error deleting label:', error);
        }
    };

    const getInitials = (name) =>
        name?.split(' ').map((word) => word[0]).join('').toUpperCase() || '';

    if (loading) return <p style={styles.loading}>Loading user data...</p>;

    return (
        <div style={styles.container}>
            <div style={styles.logoutButtonContainer}>
                <button
                    style={styles.logoutButton}
                    onMouseEnter={(e) => Object.assign(e.target.style, styles.logoutButtonHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, styles.logoutButton)}
                    onClick={() => {
                        sessionStorage.removeItem('token');
                        navigate('/login');
                    }}
                >
                    Log out
                </button>
            </div>
            <button
                onClick={() => navigate('/Dashboard')}
                style={styles.backButton}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.backButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.backButton)}
            >
                &lt; Back
            </button>

            <div style={styles.profileTitle}>User Profile</div>

            {userData ? (
                <div>
                    <div style={styles.profileHeader}>
                        {userData.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="Profile" style={styles.profilePhoto} />
                        ) : (
                            <div style={styles.initialsCircle}>{getInitials(userData.name)}</div>
                        )}

                        <div
                            style={styles.profileDetails}
                            onMouseEnter={() => setShowEditIcon(true)}
                            onMouseLeave={() => setShowEditIcon(false)}
                        >
                            {editMode ? (
                                <div style={styles.editNameContainer}>
                                    <input
                                        type="text"
                                        value={updatedName}
                                        onChange={(e) => setUpdatedName(e.target.value)}
                                        style={styles.nameInput}
                                    />
                                    <button onClick={handleUpdateName} style={styles.saveButton}>
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.nameContainer}>
                                    <h3 style={styles.name}>{userData.name}</h3>
                                    {showEditIcon && (
                                        <button style={styles.editButton} onClick={() => setEditMode(true)}>
                                            ✎
                                        </button>
                                    )}
                                </div>
                            )}
                            <p style={styles.email}>Email: {userData.email}</p>
                        </div>

                        <button style={styles.addLabelButton} onClick={() => navigate('/individualregistration')}>
                            Add Label
                        </button>
                    </div>

                    {/* PTM Labels */}
                    <h4 style={styles.labelsHeader}>
                        Registered Face Labels [PTM]
                        <button style={styles.arrowButton} onClick={() => setShowPLabels(!showPLabels)}>
                            {showPLabels ? '▲' : '▼'}
                        </button>
                    </h4>

                    {showPLabels && (
                        <ul style={styles.labelList}>
                            {pLabels?.length > 0 ? (
                                pLabels.map((label, index) => (
                                    <li key={index} style={{ ...styles.labelItem, ...styles.labelItemRow }}>
                                        <span style={styles.labelText}>{label}</span>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => handleDeleteLabel(label, 'PTM')}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p style={styles.noLabels}>No labels registered yet.</p>
                            )}
                        </ul>
                    )}

                    {/* CNN Labels */}
                    <h4 style={styles.labelsHeader}>
                        Registered Face Labels [CNN]
                        <button style={styles.arrowButton} onClick={() => setShowCnnLabels(!showCnnLabels)}>
                            {showCnnLabels ? '▲' : '▼'}
                        </button>
                    </h4>

                    {showCnnLabels && (
                        <ul style={styles.labelList}>
                            {cnnLabels?.length > 0 ? (
                                cnnLabels.map((label, index) => (
                                    <li key={index} style={{ ...styles.labelItem, ...styles.labelItemRow }}>
                                        <span style={styles.labelText}>{label}</span>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => handleDeleteLabel(label, 'CNN')}
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p style={styles.noLabels}>No CNN labels registered yet.</p>
                            )}
                        </ul>
                    )}

                    <button style={styles.viewHistoryButton} onClick={() => navigate('/history')}>
                        View History
                    </button>
                </div>
            ) : (
                <p style={styles.noData}>No user data available.</p>
            )}
        </div>
    );
};

export default UserProfile;
