package fr.diabetips.api.controller;

import fr.diabetips.api.exception.ApiError;
import fr.diabetips.api.exception.ApiException;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@ControllerAdvice
@RestController
public class ErrorController extends ResponseEntityExceptionHandler implements org.springframework.boot.web.servlet.error.ErrorController {

    private static final String ERROR_PATH = "/error";

    private final ErrorAttributes errorAttributes;

    public ErrorController(ErrorAttributes errorAttributes) {
        this.errorAttributes = errorAttributes;
    }

    @Override
    public String getErrorPath() {
        return ERROR_PATH;
    }

    @RequestMapping(ERROR_PATH)
    public ResponseEntity<ErrorResponse> handleWhitelabelError(HttpServletRequest request) {
        Map<String, Object> attrs = errorAttributes.getErrorAttributes(new ServletWebRequest(request), false);
        int status = (Integer) attrs.getOrDefault("status", 500);
        String error = (String) attrs.getOrDefault("error", "Unknown error");
        return new ResponseEntity<>(new ErrorResponse(status, status + "-0000", error), HttpStatus.valueOf(status));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleParameterTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return handleApiException(new ApiException(ApiError.PARAMETER_TYPE_MISMATCH));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseError(DataAccessException ex) {
        return handleApiException(new ApiException(ApiError.DATABASE_ERROR));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        return new ResponseEntity<>(
                new ErrorResponse(ex.getHttpStatus().value(), ex.getErrorCode(), ex.getErrorMessage()),
                ex.getHttpStatus()
        );
    }


    public static class ErrorResponse {

        private final int status;

        private final String code;

        private final String error;

        ErrorResponse(int status, String code, String error) {
            this.status = status;
            this.code = code;
            this.error = error;
        }

        public int getStatus() {
            return status;
        }

        public String getCode() {
            return code;
        }

        public String getError() {
            return error;
        }

    }

}
