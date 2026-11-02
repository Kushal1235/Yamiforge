package com.yamiforge.api.auth;

import com.yamiforge.api.member.Member;
import com.yamiforge.api.member.MemberRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    /** Why a registration was refused; the value is what the API sends back as `error`. */
    public enum Conflict {
        USERNAME_TAKEN("username-taken"),
        PHONE_TAKEN("phone-taken"),
        EMAIL_TAKEN("email-taken");

        private final String code;

        Conflict(String code) {
            this.code = code;
        }

        public String code() {
            return code;
        }
    }

    private final SecureRandom random = new SecureRandom();
    private final MemberRepository members;
    private final OtpCodeRepository otpCodes;
    private final OtpSender sender;
    private final PasswordEncoder encoder;
    private final long ttlMinutes;
    private final int maxAttempts;

    AuthService(
            MemberRepository members,
            OtpCodeRepository otpCodes,
            OtpSender sender,
            PasswordEncoder encoder,
            @Value("${yamiforge.otp.ttl-minutes}") long ttlMinutes,
            @Value("${yamiforge.otp.max-attempts}") int maxAttempts) {
        this.members = members;
        this.otpCodes = otpCodes;
        this.sender = sender;
        this.encoder = encoder;
        this.ttlMinutes = ttlMinutes;
        this.maxAttempts = maxAttempts;
    }

    public static String normalizePhone(String value) {
        String digits = value.replaceAll("\\D", "");
        return digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
    }

    public static String normalizeEmail(String value) {
        return value.trim().toLowerCase();
    }

    /** Creates the member, or says which field is already taken. */
    @Transactional
    public Optional<Conflict> register(String username, String phone, String email) {
        String handle = username.trim().toLowerCase();
        String digits = normalizePhone(phone);
        String mail = normalizeEmail(email);

        Optional<Conflict> conflict = findConflict(handle, digits, mail);
        if (conflict.isPresent()) {
            return conflict;
        }
        try {
            members.saveAndFlush(new Member(handle, digits, mail));
        } catch (DataIntegrityViolationException raced) {
            // Someone registered the same value between the check and the insert.
            return Optional.of(findConflict(handle, digits, mail).orElse(Conflict.USERNAME_TAKEN));
        }
        return Optional.empty();
    }

    /** Issues a fresh code. Returns false when no member matches the identifier. */
    @Transactional
    public boolean requestOtp(OtpMethod method, String identifier) {
        Optional<Member> member = find(method, identifier);
        if (member.isEmpty()) {
            return false;
        }
        String code = "%06d".formatted(random.nextInt(1_000_000));
        otpCodes.deleteByMemberId(member.get().getId());
        otpCodes.save(new OtpCode(
                member.get().getId(), encoder.encode(code), Instant.now().plusSeconds(ttlMinutes * 60)));
        sender.send(member.get(), method, code);
        return true;
    }

    /** Returns the member when the code is right; a wrong guess counts against the code. */
    @Transactional
    public Optional<Member> verifyOtp(OtpMethod method, String identifier, String code) {
        Optional<Member> member = find(method, identifier);
        if (member.isEmpty()) {
            return Optional.empty();
        }
        Optional<OtpCode> stored = otpCodes.findFirstByMemberIdOrderByIdDesc(member.get().getId());
        if (stored.isEmpty()) {
            return Optional.empty();
        }
        OtpCode otp = stored.get();
        if (otp.getExpiresAt().isBefore(Instant.now()) || otp.getAttempts() >= maxAttempts) {
            otpCodes.delete(otp);
            return Optional.empty();
        }
        if (!encoder.matches(code.trim(), otp.getCodeHash())) {
            otp.recordFailedAttempt();
            return Optional.empty();
        }
        otpCodes.delete(otp);
        return member;
    }

    private Optional<Conflict> findConflict(String username, String phone, String email) {
        if (members.existsByUsername(username)) {
            return Optional.of(Conflict.USERNAME_TAKEN);
        }
        if (members.existsByPhone(phone)) {
            return Optional.of(Conflict.PHONE_TAKEN);
        }
        if (members.existsByEmail(email)) {
            return Optional.of(Conflict.EMAIL_TAKEN);
        }
        return Optional.empty();
    }

    private Optional<Member> find(OtpMethod method, String identifier) {
        return switch (method) {
            case EMAIL -> members.findByEmail(normalizeEmail(identifier));
            case PHONE -> members.findByPhone(normalizePhone(identifier));
        };
    }
}
