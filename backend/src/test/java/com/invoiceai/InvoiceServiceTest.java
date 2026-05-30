package com.invoiceai;

import com.invoiceai.util.InvoiceUtils;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.assertj.core.api.Assertions.*;

class InvoiceServiceTest {

    @Test
    void deriveStatus_overdue_whenDueDateInPast() {
        LocalDate past = LocalDate.now().minusDays(5);
        assertThat(InvoiceUtils.deriveStatus(past)).isEqualTo("OVERDUE");
    }

    @Test
    void deriveStatus_pending_whenDueDateInFuture() {
        LocalDate future = LocalDate.now().plusDays(5);
        assertThat(InvoiceUtils.deriveStatus(future)).isEqualTo("PENDING");
    }

    @Test
    void parseDate_returnsNull_forBlank() {
        assertThat(InvoiceUtils.parseDate(null)).isNull();
        assertThat(InvoiceUtils.parseDate("")).isNull();
        assertThat(InvoiceUtils.parseDate("not-a-date")).isNull();
    }

    @Test
    void parseDate_parsesValidIsoDate() {
        assertThat(InvoiceUtils.parseDate("2026-06-01")).isEqualTo(LocalDate.of(2026, 6, 1));
    }
}
