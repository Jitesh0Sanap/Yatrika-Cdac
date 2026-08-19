package com.yatrika.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadPath = uploadDirPath.toUri().toString(); // Creates a file:/ URL

        registry.addResourceHandler("/api/images/**")
                .addResourceLocations(uploadPath);
    }
}
