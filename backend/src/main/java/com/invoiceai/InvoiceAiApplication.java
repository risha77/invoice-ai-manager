package com.invoiceai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class InvoiceAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(InvoiceAiApplication.class, args);
    }
}
