package fr.diabetips.api.exception;

import org.springframework.http.HttpStatus;

public enum ApiError {
    PARAMETER_TYPE_MISMATCH(HttpStatus.BAD_REQUEST, "Parameter type mismatch"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Database error"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation error"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    EMAIL_ALREADY_TAKEN(HttpStatus.FORBIDDEN, "Email already taken"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied");

    private final HttpStatus httpStatus;

    private final String errorMessage;

    ApiError(HttpStatus httpStatus, String errorMessage) {
        this.httpStatus = httpStatus;
        this.errorMessage = errorMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getErrorCode() {
        return String.format("%03d-%04d", httpStatus.value(), ordinal() + 1);
    }
}
