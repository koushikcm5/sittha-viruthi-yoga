package com.yoga.attendance.util;

import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {
    
    public String sanitize(String input) {
        if (input == null) return null;
        return input.trim()
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#x27;")
            .replaceAll("/", "&#x2F;");
    }
    
    public String sanitizeForSql(String input) {
        if (input == null) return null;
        return input.replaceAll("[';\"\\\\]", "");
    }
}
