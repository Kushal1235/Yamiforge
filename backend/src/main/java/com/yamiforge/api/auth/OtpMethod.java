package com.yamiforge.api.auth;

public enum OtpMethod {
    EMAIL,
    PHONE;

    public static OtpMethod parse(String value) {
        return valueOf(value.toUpperCase());
    }
}
