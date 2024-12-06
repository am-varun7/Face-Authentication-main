const styles = {
    container: {
        fontFamily: 'Kumbh Sans, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        // backgroundColor: '#f8f8f8',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginTop: '30px',
    },
    profileTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '4px solid #3498db',
        textTransform: 'uppercase',
        letterSpacing: '2px',
    },
    dateToggleContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '10px',
        marginBottom: '20px',
    },
    dateToggleButton: {
        padding: '8px 15px',
        backgroundColor: '#0b76e9e7',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    },
    selectDateToggleButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#079364c0',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '200px', // Aligns the button to the right
    },
    dateToggleButtonHover: {
        backgroundColor: '#45a049',
    },
    calendarWrapper: {
        marginTop: '10px',
    },
    historySection: {
        marginTop: '30px',
        // backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    historyTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '15px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '5px',
    },
    labelList: {
        listStyleType: 'none',
        padding: '0',
        margin: '0',
    },
    labelItem: {
        // backgroundColor: '#ffffff',
        backgroundColor: '#f7f7f7',
        marginBottom: '10px',
        padding: '15px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    labelText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '5px',
    },
    noData: {
        fontSize: '16px',
        fontStyle: 'italic',
        color: '#999',
        textAlign: 'center',
        marginTop: '10px',
    },
    loading: {
        fontSize: '18px',
        fontWeight: '600',
        textAlign: 'center',
        color: '#007bff',
    },
    calendarButton: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        borderRadius: '5px',
        marginTop: '10px',
    },
    calendarButtonHover: {
        backgroundColor: '#0056b3',
    },
    labelTextWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelTime: {
        fontSize: '14px',
        color: '#333',
        marginLeft: '10px', // Adjusts space between label name and time
    },
    backButton: {
        position: 'absolute', // Fixed to a specific position
        top: '20px',
        left: '20px', // Align to the left
        width: '6rem', // Fixed width
        backgroundColor: '#ff6200', // Orange background
        color: 'white', // White text
        border: 'none', // No border
        borderRadius: '30px', // Rounded corners
        fontSize: '16px', // Font size
        padding: '8px 16px', // Padding for better clickability
        cursor: 'pointer', // Pointer cursor for interaction
        transition: 'background-color 0.3s ease, transform 0.2s ease', // Smooth transitions
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(3px)',
    },
    backButtonHover: {
        backgroundColor: '#e05a00', // Slightly darker shade on hover
        transform: 'translateY(-3px)', // Lift effect on hover
    },
};

export default styles;
