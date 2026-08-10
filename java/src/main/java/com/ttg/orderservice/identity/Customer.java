package com.ttg.orderservice.identity;

/** The customer a request claims to be acting as. Null when the caller claims none. */
public record Customer(String email) {
}
