/***CREATING ALL TABLES*/
CREATE TABLE IF NOT EXISTS BOOKS (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(50) DEFAULT NULL,
                    date VARCHAR(50) DEFAULT NULL,
                    author VARCHAR(50) DEFAULT NULL,
                    description VARCHAR(301) DEFAULT NULL,
                    image VARCHAR(50) DEFAULT NULL
                )
                COLLATE='utf8_unicode_ci'
                ENGINE=InnoDB;



