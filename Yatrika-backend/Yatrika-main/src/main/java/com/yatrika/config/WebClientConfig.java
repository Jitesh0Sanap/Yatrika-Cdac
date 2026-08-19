package com.yatrika.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient loggingWebClient(@Value("${hotel.logging.service.url}") String loggingServiceUrl) {
        // loggingServiceUrl already includes /api/v1/logs, so strip it back to a base URL
        String baseUrl = loggingServiceUrl.replace("/api/v1.0/logs", "");
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}