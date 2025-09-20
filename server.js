const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize SQLite database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Users table ready.');
                
                // Create contacts table if it doesn't exist
                db.run(`CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT NOT NULL,
                    company TEXT,
                    message TEXT NOT NULL,
                    best_time TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    contacted BOOLEAN DEFAULT 0
                )`, (err) => {
                    if (err) {
                        console.error('Error creating contacts table:', err.message);
                    } else {
                        console.log('Contacts table ready.');
                    }
                });
                // Insert default admin users if they don't exist
                const adminUsers = [
                    { username: 'Ryan', password: 'Ryan', role: 'admin' },
                    { username: 'Hunter', password: 'Hunter', role: 'user' }
                ];
                
                adminUsers.forEach(admin => {
                    db.get('SELECT * FROM users WHERE username = ?', [admin.username], (err, row) => {
                        if (err) {
                            console.error(`Error checking ${admin.username} user:`, err.message);
                        } else if (!row) {
                            // Hash the admin password and insert
                            bcrypt.hash(admin.password, 10, (err, hashedPassword) => {
                                if (err) {
                                    console.error(`Error hashing ${admin.username} password:`, err.message);
                                } else {
                                    db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                                        [admin.username, hashedPassword], (err) => {
                                        if (err) {
                                            console.error(`Error inserting ${admin.username} user:`, err.message);
                                        } else {
                                            console.log(`${admin.username} user created successfully.`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }
});

// API Routes

// Create new user account
app.post('/api/create-user', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required.' 
        });
    }
    
    try {
        // Check if username already exists
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error occurred.' 
                });
            }
            
            if (row) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username already exists. Please choose a different username.' 
                });
            }
            
            // Hash password and create user
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                    [username, hashedPassword], function(err) {
                    if (err) {
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Error creating user account.' 
                        });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: `Credentials created successfully for username: ${username}`,
                        userId: this.lastID
                    });
                });
            } catch (hashError) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error processing password.' 
                });
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error occurred.' 
        });
    }
});

// Validate user login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username and password are required.' 
        });
    }
    
    try {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error occurred.' 
                });
            }
            
            if (!row) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid username or password.' 
                });
            }
            
            try {
                // Compare password with hashed password
                const passwordMatch = await bcrypt.compare(password, row.password);
                
                if (passwordMatch) {
                    // Determine user role based on username
                    let userRole = 'user';
                    if (username === 'Ryan') {
                        userRole = 'admin';
                    }
                    
                    res.json({ 
                        success: true, 
                        message: 'Login successful!',
                        username: username,
                        role: userRole
                    });
                } else {
                    res.status(401).json({ 
                        success: false, 
                        message: 'Invalid username or password.' 
                    });
                }
            } catch (compareError) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error validating password.' 
                });
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error occurred.' 
        });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    const { name, phone, email, company, message, bestTime } = req.body;
    
    if (!name || !phone || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, phone, email, and message are required.' 
        });
    }
    
    try {
        db.run(`INSERT INTO contacts (name, phone, email, company, message, best_time) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
            [name, phone, email, company || null, message, bestTime || null], 
            function(err) {
                if (err) {
                    console.error('Error saving contact:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error saving contact information.' 
                    });
                }
                
                console.log(`New contact received from ${name} (${phone}) - ID: ${this.lastID}`);
                res.json({ 
                    success: true, 
                    message: 'Thank you for contacting us! We\'ll get back to you soon.',
                    contactId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error occurred.' 
        });
    }
});

// Get all contacts (for you to see who contacted you)
app.get('/api/contacts', (req, res) => {
    db.all(`SELECT id, name, phone, email, company, message, best_time, 
            created_at, contacted FROM contacts ORDER BY created_at DESC`, 
        [], (err, rows) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error fetching contacts.' 
                });
            }
            res.json({ success: true, contacts: rows });
        }
    );
});

// Mark contact as contacted
app.put('/api/contacts/:id/contacted', (req, res) => {
    const contactId = req.params.id;
    
    db.run('UPDATE contacts SET contacted = 1 WHERE id = ?', [contactId], function(err) {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating contact status.' 
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Contact not found.' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Contact marked as contacted.' 
        });
    });
});

// Get all users (for development/debugging - remove in production)
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, created_at FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching users.' 
            });
        }
        res.json({ success: true, users: rows });
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Visit http://localhost:3000 to access the login system');
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});