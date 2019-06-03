package fr.diabetips.api.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus httpStatus;

    private final String errorCode;

    private final String errorMessage;

    public ApiException(ApiError error) {
        super(error.getErrorMessage());
        this.httpStatus = error.getHttpStatus();
        this.errorCode = error.getErrorCode();
        this.errorMessage = error.getErrorMessage();
    }

    public ApiException(ApiError error, String errorMessage) {
        super(errorMessage);
        this.httpStatus = error.getHttpStatus();
        this.errorCode = error.getErrorCode();
        this.errorMessage = errorMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
