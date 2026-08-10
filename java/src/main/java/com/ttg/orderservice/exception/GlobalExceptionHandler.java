package com.ttg.orderservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> details = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::detail)
                .toList();

        return ResponseEntity.badRequest()
                .body(Map.of("error", "Validation failed", "details", details));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private static Map<String, String> detail(FieldError error) {
        String message = error.getDefaultMessage() != null ? error.getDefaultMessage() : "is invalid";
        return Map.of("path", error.getField(), "message", message);
    }
}
