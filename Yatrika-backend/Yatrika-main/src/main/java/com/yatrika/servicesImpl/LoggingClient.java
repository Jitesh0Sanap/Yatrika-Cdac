package com.yatrika.servicesImpl;
 

import com.yatrika.dto.LogEntryRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoggingClient {

    private final WebClient loggingWebClient;

    public void log(LogEntryRequest entry) {
        loggingWebClient.post()
                .uri("/api/v1.0/logs")
                .bodyValue(entry)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(err -> log.warn("Failed to reach HotelLoggingService: {}", err.getMessage()))
                .onErrorResume(err -> Mono.empty()) // never let logging break the caller
                .subscribe(); // fire-and-forget, non-blocking
    }
}