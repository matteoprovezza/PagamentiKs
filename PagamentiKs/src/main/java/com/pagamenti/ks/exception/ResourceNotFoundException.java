package com.pagamenti.ks.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s non trovato con %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
