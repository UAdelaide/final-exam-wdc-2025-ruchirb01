USE DogWalkService;

-- Create Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'walker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dogs table
CREATE TABLE Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create WalkRequests table
CREATE TABLE WalkRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    dog_id INT,
    requested_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('open', 'accepted', 'completed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id) ON DELETE CASCADE
);

-- Create WalkApplications table
CREATE TABLE WalkApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    walker_id INT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (walker_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Insert test users for login testing
INSERT INTO Users (username, email, password_hash, role) VALUES
('bruhmeme', 'bruhmeme@bruh.com', 'bryh', 'owner'),
('nobruh', 'walker.bruh@gay.com', 'imnotgay', 'walker'),

-- Insert test dogs
INSERT INTO Dogs (name, size, owner_id) VALUES
('meow', 'large', 1),  
('rawr', 'medium', 1),   

-- Insert some sample walk requests
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
(1, '2025-06-22 10:00:00', 30, 'africa', 'open'),
(2, '2025-06-22 14:00:00', 45, 'idk where trhis is', 'open'),


-- Verify the data was inserted
SELECT 'Users created:' as info;
SELECT user_id, username, email, role FROM Users;

SELECT 'Dogs created:' as info;
SELECT d.dog_id, d.name, d.size, u.username as owner_name
FROM Dogs d
JOIN Users u ON d.owner_id = u.user_id;

SELECT 'Walk requests created:' as info;
SELECT wr.request_id, d.name as dog_name, wr.requested_time, wr.duration_minutes, wr.location, wr.status
FROM WalkRequests wr
JOIN Dogs d ON wr.dog_id = d.dog_id;
