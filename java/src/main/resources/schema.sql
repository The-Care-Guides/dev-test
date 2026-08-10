-- Wiped first so schema.sql and data.sql can re-run against an in-memory database that
-- is still live: `jdbc:h2:mem:orderdb` is shared JVM-wide, so a second Spring context in
-- the same test run (a second @SpringBootTest class) initializes the same database again.
-- DROP ALL OBJECTS rather than a list of tables, so this keeps working when tables are
-- added. It also resets AUTO_INCREMENT, which data.sql relies on for its id references.
DROP ALL OBJECTS;

CREATE TABLE performances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    capacity INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2),
    payment_reference VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    performance_id BIGINT NOT NULL,
    section VARCHAR(100) NOT NULL,
    seat_row VARCHAR(10),
    seat_number INT,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (performance_id) REFERENCES performances(id)
);

-- One row per presentation of a ticket at a door, admitted or turned away.
-- ticket_id is nullable so a presentation that resolves to no ticket can still be
-- recorded. `result` is free text: the vocabulary of outcomes is a design decision.
CREATE TABLE scan_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT,
    result VARCHAR(50) NOT NULL,
    scanned_by VARCHAR(255),
    scanned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
