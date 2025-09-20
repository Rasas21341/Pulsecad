// Check if user is logged in
window.addEventListener('load', function() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const username = sessionStorage.getItem('username');
    
    if (isLoggedIn !== 'true' || !username) {
        // Redirect to login if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    document.getElementById('usernameDisplay').textContent = username;
});

// Logout function
function logout() {
    // Clear session storage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    
    // Show logout message
    alert('You have been logged out successfully!');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Show alert for admin actions (placeholder functionality)
function showAlert(action) {
    alert(`${action} feature would be implemented here.\n\nThis is a demo dashboard showing the basic structure.`);
}

// Add some interactive dashboard features
document.addEventListener('DOMContentLoaded', function() {
    // Update the current time in activity
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Add dynamic content
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const loginActivity = activityList.querySelector('.activity-item');
        if (loginActivity) {
            const timeSpan = loginActivity.querySelector('.activity-time');
            timeSpan.textContent = `${timeString}`;
        }
    }
});