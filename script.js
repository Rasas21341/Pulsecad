// DOM elements
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

// Handle form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get input values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        // Send login request to server
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // All users go to dashboard now - no special contact admin routing
            hideError();
            showSuccess();
            
            // Store login state
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userRole', data.role || 'user');
            
            // Clear any admin session
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Failed login
            showError(data.message || 'Invalid username or password. Please try again.');
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Add shake animation to form
            const loginContainer = document.querySelector('.login-container');
            loginContainer.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                loginContainer.style.animation = '';
            }, 500);
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback: Check localStorage credentials if server is down
        const storedCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
        const userExists = storedCredentials.find(cred => 
            cred.username === username && cred.password === password
        );
        
        // Also check default admin accounts
        if (userExists || 
            (username === 'Ryan' && password === 'Ryan') || 
            (username === 'Hunter' && password === 'Hunter') || 
            (username === 'admin' && password === 'admin123')) {
            
            // All users go to dashboard - no special contact admin routing
            hideError();
            showSuccess();
            
            // Store login state
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userRole', username === 'Ryan' ? 'admin' : 'user');
            
            // Clear any admin session for regular users
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showError('Invalid username or password. Please try again.');
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Add shake animation to form
            const loginContainer = document.querySelector('.login-container');
            loginContainer.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                loginContainer.style.animation = '';
            }, 500);
        }
    }
});

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#fee';
    errorMessage.style.color = '#c33';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Show success message
function showSuccess() {
    errorMessage.textContent = 'Login successful! Redirecting to dashboard...';
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#efe';
    errorMessage.style.color = '#393';
    errorMessage.style.borderColor = '#cfc';
}

// Add CSS animation for shake effect
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Check if user is already logged in
window.addEventListener('load', function() {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }
});

// Pricing modal functions
function showPricing() {
    document.getElementById('pricingModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closePricing() {
    document.getElementById('pricingModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function selectPlan(planName) {
    let message = `You selected the ${planName} plan!`;
    
    switch(planName) {
        case 'Beginner':
            message += '\n\nFree plan selected. You can start using basic features immediately after logging in.';
            break;
        case 'Premium':
            message += '\n\n$12.99/month plan selected. Payment processing would be implemented here.';
            break;
        case 'Super Premium':
            message += '\n\n$20.00/month plan selected. Payment processing would be implemented here.';
            break;
    }
    
    alert(message);
    closePricing();
    
    // Store selected plan
    sessionStorage.setItem('selectedPlan', planName);
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('pricingModal');
    if (event.target === modal) {
        closePricing();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePricing();
    }
});

// Create login function
async function createLogin() {
    // Get the current username and password from the form
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate that both fields are filled
    if (!username || !password) {
        showError('Please enter both username and password to create credentials.');
        return;
    }
    
    try {
        // Send create user request to server
        const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccess(data.message);
            
            // Clear the form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            // Show error message
            showError(data.message);
        }
    } catch (error) {
        console.error('Create user error:', error);
        
        // Fallback: Save to localStorage if server is down
        const storedCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
        
        // Check if username already exists in localStorage
        const existingUser = storedCredentials.find(cred => cred.username === username);
        if (existingUser) {
            showError('Username already exists. Please choose a different username.');
            return;
        }
        
        // Add new credentials to localStorage as backup
        storedCredentials.push({
            username: username,
            password: password,
            created: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('userCredentials', JSON.stringify(storedCredentials));
        
        // Show success message
        showSuccess(`Account created successfully for username: ${username}. You can now login.`);
        
        // Clear the form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}