package com.ttg.orderservice.identity;

/** The venue staff member a request claims to be acting as. Null when the caller claims none. */
public record Staff(String id) {
}
