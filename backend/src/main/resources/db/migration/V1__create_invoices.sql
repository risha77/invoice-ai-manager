CREATE TABLE invoices (
    id               VARCHAR(36)    PRIMARY KEY,
    vendor           VARCHAR(255),
    amount           NUMERIC(15,2),
    currency         VARCHAR(10)    NOT NULL DEFAULT 'INR',
    invoice_date     DATE,
    due_date         DATE,
    category         VARCHAR(50)    NOT NULL DEFAULT 'OTHER',
    invoice_number   VARCHAR(100),
    status           VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
    raw_ocr_text     TEXT,
    ai_summary       TEXT,
    anomaly          TEXT,
    file_name        VARCHAR(255),
    file_storage_path VARCHAR(512),
    uploaded_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_status   ON invoices(status);
CREATE INDEX idx_invoices_vendor   ON invoices(vendor);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_category ON invoices(category);
