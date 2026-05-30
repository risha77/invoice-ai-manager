package com.invoiceai.service;

import java.io.OutputStream;
import java.io.Writer;

public interface ExportService {
    void writeCsv(Writer writer) throws Exception;
    void writePdf(OutputStream out) throws Exception;
}
