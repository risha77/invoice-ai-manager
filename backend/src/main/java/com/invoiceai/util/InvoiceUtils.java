package com.invoiceai.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class InvoiceUtils {

    private InvoiceUtils() {}

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Safely parse a "YYYY-MM-DD" string to LocalDate; returns null on failure.
     */
    public static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s.trim(), ISO);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    /**
     * Determine OVERDUE vs PENDING based on due date compared to today.
     */
    public static String deriveStatus(LocalDate dueDate) {
        if (dueDate == null) return "PENDING";
        return dueDate.isBefore(LocalDate.now()) ? "OVERDUE" : "PENDING";
    }

    /**
     * Returns days since due date (positive = overdue).
     */
    public static long daysOverdue(LocalDate dueDate) {
        if (dueDate == null) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }
}
