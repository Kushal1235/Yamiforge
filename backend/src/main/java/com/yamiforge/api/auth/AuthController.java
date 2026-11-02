package com.yamiforge.api.auth;

import com.yamiforge.api.member.Member;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

    record RegisterRequest(
            @NotBlank @Size(min = 3, max = 30) @Pattern(regexp = "[A-Za-z0-9_.]+") String username,
            @NotBlank @Pattern(regexp = "[+\\d\\s()-]{10,20}") String phone,
            @NotBlank @Email @Size(max = 254) String email) {
    }

    record OtpRequest(
            @NotBlank @Pattern(regexp = "email|phone") String method,
            @NotBlank @Size(max = 254) String identifier) {
    }

    record VerifyRequest(
            @NotBlank @Pattern(regexp = "email|phone") String method,
            @NotBlank @Size(max = 254) String identifier,
            @NotBlank @Size(max = 12) String otp) {
    }

    /** Same shape as the frontend's `Member`. */
    record MemberResponse(String username, String name) {
        static MemberResponse of(String username) {
            return new MemberResponse(username, username);
        }
    }

    private final SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();
    private final AuthService auth;

    AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    ResponseEntity<?> register(@Valid @RequestBody RegisterRequest body) {
        return auth.register(body.username(), body.phone(), body.email())
                .<ResponseEntity<?>>map(conflict ->
                        ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", conflict.code())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CREATED).build());
    }

    @PostMapping("/otp/request")
    ResponseEntity<?> requestOtp(@Valid @RequestBody OtpRequest body) {
        boolean sent = auth.requestOtp(OtpMethod.parse(body.method()), body.identifier());
        return sent
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "not-found"));
    }

    @PostMapping("/otp/verify")
    ResponseEntity<?> verifyOtp(
            @Valid @RequestBody VerifyRequest body, HttpServletRequest request, HttpServletResponse response) {
        return auth.verifyOtp(OtpMethod.parse(body.method()), body.identifier(), body.otp())
                .<ResponseEntity<?>>map(member -> {
                    startSession(member, request, response);
                    return ResponseEntity.ok(MemberResponse.of(member.getUsername()));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /** The signed-in member, or 401. The frontend calls this on startup to restore the session. */
    @GetMapping("/me")
    MemberResponse me(Authentication authentication) {
        return MemberResponse.of(authentication.getName());
    }

    private void startSession(Member member, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) {
            request.changeSessionId(); // a new id at login blocks session fixation
        }
        Authentication token = UsernamePasswordAuthenticationToken.authenticated(
                member.getUsername(), null, List.of(new SimpleGrantedAuthority("ROLE_MEMBER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(token);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
    }
}
