package com.yatrika.config;

import com.yatrika.dto.LogEntryRequest;
import com.yatrika.enums.LogLevel;
import com.yatrika.repository.UserRepository;
import com.yatrika.servicesImpl.LoggingClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class LoggingAspect {

    private final LoggingClient loggingClient;
    private final UserRepository userRepository;

    @Around("@annotation(com.yatrika.config.Loggable)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String serviceName = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String correlationId = UUID.randomUUID().toString();
        
        LogEntryRequest logRequest = LogEntryRequest.builder()
                .serviceName(serviceName)
                .moduleName(methodName)
                .correlationId(correlationId)
                .build();

        // Extract Web Request details
        org.springframework.web.context.request.ServletRequestAttributes attributes = 
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            jakarta.servlet.http.HttpServletRequest request = attributes.getRequest();
            logRequest.setRequestUrl(request.getRequestURI());
            logRequest.setHttpMethod(request.getMethod());
            logRequest.setIpAddress(request.getRemoteAddr());

            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                    logRequest.setUserId(user.getUserId().intValue());
                });
            }
        }

        try {
            Object proceed = joinPoint.proceed();
            
            long executionTime = System.currentTimeMillis() - start;
            
            logRequest.setLogLevel(LogLevel.INFORMATION);
            logRequest.setMessage("Successfully executed " + methodName);
            logRequest.setExecutionTime(executionTime);
            
            if (attributes != null && attributes.getResponse() != null) {
                int status = attributes.getResponse().getStatus();
                // Default to 201 for POST success, 200 for others if status is unset (200 is default)
                if (status == 200 && "POST".equalsIgnoreCase(logRequest.getHttpMethod())) {
                    logRequest.setStatusCode(201);
                } else {
                    logRequest.setStatusCode(status);
                }
            } else {
                logRequest.setStatusCode(200);
            }
            
            loggingClient.log(logRequest);
            
            return proceed;
        } catch (Throwable e) {
            long executionTime = System.currentTimeMillis() - start;
            
            logRequest.setLogLevel(LogLevel.ERROR);
            logRequest.setMessage("Error during execution of " + methodName);
            logRequest.setExecutionTime(executionTime);
            logRequest.setExceptionMessage(e.getMessage());
            logRequest.setStatusCode(500);
            
            String stackTrace = getStackTrace(e);
            if (stackTrace.length() > 2000) {
                stackTrace = stackTrace.substring(0, 2000);
            }
            logRequest.setStackTrace(stackTrace);
            
            loggingClient.log(logRequest);
            
            throw e;
        }
    }

    private String getStackTrace(Throwable throwable) {
        StringBuilder sb = new StringBuilder();
        for (StackTraceElement element : throwable.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }
}
