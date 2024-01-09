import React from 'react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90vh',
        textAlign: 'center',
        color: '#555',
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    title: {
        fontSize: '4rem',
        marginBottom: '20px'
    },
    description: {
        fontSize: '1.5rem'
    }
};

export const PageNotFound = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>404</h1>
            <p style={styles.description}>Oops! Page not found.</p>
        </div>
    );
}
