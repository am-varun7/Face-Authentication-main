import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CSS_History'; // Import styles from styles.js
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const History = () => {
    const [verificationData, setVerificationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateToggle, setDateToggle] = useState('today');

    useEffect(() => {
        const fetchVerificationData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const response = await axios.get('http://localhost:5000/api/face/verification-history', {
                    headers: {
                        'auth-token': token,
                    },
                });

                const sortedData = response.data.history.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );
                setVerificationData(sortedData);
            } catch (error) {
                console.error('Error fetching verification data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, []);

    const groupByDate = (data) => {
        const groupedData = {
            today: [],
            yesterday: [],
            selectedDate: [],
        };

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        data.forEach((entry) => {
            const entryDate = new Date(entry.timestamp);
            const formattedEntryDate = formatDate(entryDate);
            const selectedFormattedDate = formatDate(selectedDate);

            if (formattedEntryDate === formatDate(today)) {
                groupedData.today.push(entry);
            } else if (formattedEntryDate === formatDate(yesterday)) {
                groupedData.yesterday.push(entry);
            } else if (formattedEntryDate === selectedFormattedDate) {
                groupedData.selectedDate.push(entry);
            }
        });

        return groupedData;
    };

    // Function to format the date to dd-mm-yyyy
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    if (loading) {
        return <p style={styles.loading}>Loading verification history...</p>;
    }

    const groupedData = groupByDate(verificationData);

    const getPeriodTitleWithDate = (period) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (period === 'today') return `Today (${formatDate(today)})`;
        if (period === 'yesterday') return `Yesterday (${formatDate(yesterday)})`;
        return `Selected Date (${formatDate(selectedDate)})`;
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setDateToggle('selectedDate');
        setShowCalendar(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.profileTitle}>Verification History</div>

            {/* Date Selection and Toggle */}
            <div style={styles.dateToggleContainer}>
                <button
                    style={styles.dateToggleButton}
                    onClick={() => setDateToggle('today')}
                >
                    Today
                </button>
                <button
                    style={styles.dateToggleButton}
                    onClick={() => setDateToggle('yesterday')}
                >
                    Yesterday
                </button>
                <button
                    style={styles.selectDateToggleButton}
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    📅 Select Date
                </button>
            </div>

            {/* Calendar for Date Selection (Positioned top-right inside the card) */}
            {showCalendar && (
                <div style={styles.calendarWrapper}>
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                        minDate={new Date('2024-08-30')} // You can change this to any start date
                        maxDate={new Date()} // Current date as max date
                    />
                </div>
            )}

            {/* Display Verification Data */}
            <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>{getPeriodTitleWithDate(dateToggle)}</h3>
                {groupedData[dateToggle].length > 0 ? (
                    <ul style={styles.labelList}>
                        {groupedData[dateToggle].map((entry, index) => (
                            <li key={index} style={styles.labelItem}>
                                <div style={styles.labelTextWrapper}>
                                    <p style={styles.labelText}>
                                        <strong>Label:</strong> {entry.labelName}
                                    </p>
                                    <p style={styles.labelTime}>
                                        <strong>Time:</strong>{' '}
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={styles.noData}>
                        No verifications for this period.
                    </p>
                )}
            </div>
        </div>
    );
};

export default History;
