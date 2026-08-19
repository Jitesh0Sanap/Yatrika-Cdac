package com.yatrika.config;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.yatrika.dto.LogEntryRequest;
import com.yatrika.enums.LogLevel;
import com.yatrika.servicesImpl.LoggingClient;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final LoggingClient loggingClient;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex, HttpServletRequest request) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));

        loggingClient.log(LogEntryRequest.builder()
                .serviceName("Yatrika Booking Service")
                .moduleName(request.getRequestURI())
                .logLevel(LogLevel.ERROR)
                .message(ex.getMessage())
                .requestUrl(request.getRequestURI())
                .httpMethod(request.getMethod())
                .statusCode(500)
                .ipAddress(request.getRemoteAddr())
                .exceptionMessage(ex.toString())
                .stackTrace(sw.toString())
                .build());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong.");
    }
}