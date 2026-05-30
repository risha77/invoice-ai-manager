package com.invoiceai.repository;

import com.invoiceai.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    /* ── Full-text + filter search ─────────────────────────────────────── */
    @Query("""
        SELECT i FROM Invoice i
        WHERE (:q       IS NULL OR LOWER(i.vendor) LIKE LOWER(CONCAT('%',:q,'%'))
                               OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%',:q,'%')))
          AND (:status   IS NULL OR i.status   = :status)
          AND (:category IS NULL OR i.category = :category)
          AND (:vendor   IS NULL OR LOWER(i.vendor) LIKE LOWER(CONCAT('%',:vendor,'%')))
        """)
    Page<Invoice> search(
        @Param("q")        String q,
        @Param("status")   String status,
        @Param("category") String category,
        @Param("vendor")   String vendor,
        Pageable pageable
    );

    /* ── Status queries ────────────────────────────────────────────────── */
    List<Invoice> findByStatus(String status);

    List<Invoice> findByStatusIn(List<String> statuses);

    /* ── Overdue detection ─────────────────────────────────────────────── */
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :today AND i.status = 'PENDING'")
    List<Invoice> findPendingOverdue(@Param("today") LocalDate today);

    /* ── Vendor history (for anomaly check) ────────────────────────────── */
    @Query("SELECT i FROM Invoice i WHERE i.vendor = :vendor AND i.id <> :excludeId")
    List<Invoice> findByVendorExcluding(
        @Param("vendor")    String vendor,
        @Param("excludeId") String excludeId
    );

    /* ── Analytics ─────────────────────────────────────────────────────── */
    @Query("SELECT i.category, SUM(i.amount) FROM Invoice i GROUP BY i.category")
    List<Object[]> sumByCategory();

    @Query("SELECT i.status, COUNT(i), SUM(i.amount) FROM Invoice i GROUP BY i.status")
    List<Object[]> summaryByStatus();
}
