package com.yamiforge.api.auth;

import com.yamiforge.api.member.Member;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Development stand-in: writes the code to the server log instead of sending it. */
@Component
class LoggingOtpSender implements OtpSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingOtpSender.class);

    private final boolean logCodes;

    LoggingOtpSender(@Value("${yamiforge.otp.log-codes}") boolean logCodes) {
        this.logCodes = logCodes;
    }

    @Override
    public void send(Member member, OtpMethod method, String code) {
        if (logCodes) {
            log.info("OTP for {} via {}: {}", member.getUsername(), method, code);
        }
    }
}
