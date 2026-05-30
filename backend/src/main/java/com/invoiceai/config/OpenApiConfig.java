package com.invoiceai.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "Invoice AI Manager API",
        version     = "1.0",
        description = "REST API for AI-powered invoice management with Tesseract OCR and Claude AI"
    )
)
public class OpenApiConfig {}
