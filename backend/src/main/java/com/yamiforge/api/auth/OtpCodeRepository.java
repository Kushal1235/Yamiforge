package com.yamiforge.api.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    Optional<OtpCode> findFirstByMemberIdOrderByIdDesc(Long memberId);

    void deleteByMemberId(Long memberId);
}
