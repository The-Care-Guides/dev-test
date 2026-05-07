-- Performances
INSERT INTO performances (name, venue, event_date, capacity, base_price, status)
VALUES ('Hamilton', 'Victoria Palace Theatre', '2026-04-15 19:30:00', 1200, 85.00, 'ON_SALE');

INSERT INTO performances (name, venue, event_date, capacity, base_price, status)
VALUES ('The Phantom of the Opera', 'His Majesty''s Theatre', '2026-04-16 19:30:00', 1100, 65.00, 'ON_SALE');

INSERT INTO performances (name, venue, event_date, capacity, base_price, status)
VALUES ('Les Misérables', 'Sondheim Theatre', '2026-04-17 14:30:00', 1000, 55.00, 'ON_SALE');

INSERT INTO performances (name, venue, event_date, capacity, base_price, status)
VALUES ('Wicked', 'Apollo Victoria Theatre', '2026-04-20 19:30:00', 1500, 75.00, 'ON_SALE');

INSERT INTO performances (name, venue, event_date, capacity, base_price, status)
VALUES ('The Lion King', 'Lyceum Theatre', '2026-03-10 19:30:00', 1100, 90.00, 'COMPLETED');

-- Orders
INSERT INTO orders (id, customer_name, customer_email, status, total_amount, payment_reference, created_at, updated_at)
VALUES (1, 'John Smith', 'john.smith@email.com', 'CONFIRMED', 170.00, 'PAY-001-ABC', '2026-03-01 10:30:00', '2026-03-01 10:35:00');

INSERT INTO orders (id, customer_name, customer_email, status, total_amount, payment_reference, created_at, updated_at)
VALUES (2, 'Jane Doe', 'jane.doe@email.com', 'CONFIRMED', 65.00, 'PAY-002-DEF', '2026-03-02 14:00:00', '2026-03-02 14:05:00');

INSERT INTO orders (id, customer_name, customer_email, status, total_amount, payment_reference, created_at, updated_at)
VALUES (3, 'Bob Wilson', 'bob.wilson@email.com', 'PENDING', 55.00, NULL, '2026-03-05 09:00:00', '2026-03-05 09:00:00');

INSERT INTO orders (id, customer_name, customer_email, status, total_amount, payment_reference, created_at, updated_at)
VALUES (4, 'Alice Brown', 'alice.brown@email.com', 'CANCELLED', 75.00, NULL, '2026-03-06 16:00:00', '2026-03-06 16:30:00');

INSERT INTO orders (id, customer_name, customer_email, status, total_amount, payment_reference, created_at, updated_at)
VALUES (5, 'Emma Davis', 'emma.davis@email.com', 'CONFIRMED', 180.00, 'PAY-005-GHI', '2026-03-08 11:00:00', '2026-03-08 11:10:00');

-- Tickets for Order 1 (John Smith - 2x Hamilton)
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (1, 1, 'Stalls', 'C', 14, 85.00, 'VALID');
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (1, 1, 'Stalls', 'C', 15, 85.00, 'VALID');

-- Tickets for Order 2 (Jane Doe - 1x Phantom)
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (2, 2, 'Dress Circle', 'A', 7, 65.00, 'VALID');

-- Tickets for Order 3 (Bob Wilson - 1x Les Mis, pending)
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (3, 3, 'Grand Circle', 'D', 22, 55.00, 'VALID');

-- Tickets for Order 4 (Alice Brown - 1x Wicked, cancelled)
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (4, 4, 'Stalls', 'B', 10, 75.00, 'CANCELLED');

-- Tickets for Order 5 (Emma Davis - 2x Lion King, already completed show)
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (5, 5, 'Royal Circle', 'B', 1, 90.00, 'USED');
INSERT INTO tickets (order_id, performance_id, section, seat_row, seat_number, price, status)
VALUES (5, 5, 'Royal Circle', 'B', 2, 90.00, 'USED');
