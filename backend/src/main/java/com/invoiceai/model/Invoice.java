package com.invoiceai.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id
    @Column(length = 36)
    private String id;

    private String vendor;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 10, nullable = false)
    private String currency = "INR";

    private LocalDate invoiceDate;
    private LocalDate dueDate;

    @Column(length = 50, nullable = false)
    private String category = "OTHER";

    @Column(length = 100)
    private String invoiceNumber;

    @Column(length = 30, nullable = false)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String rawOcrText;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String anomaly;

    private String fileName;
    private String fileStoragePath;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() { updatedAt = LocalDateTime.now(); }
}
