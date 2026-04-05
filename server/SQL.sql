  task_manager


CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);


CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('To Do', 'In Progress', 'Completed') DEFAULT 'To Do',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);