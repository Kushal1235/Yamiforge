package com.yamiforge.api.auth;

import com.yamiforge.api.member.Member;

/** Delivers a one-time code to a member. Swap the implementation for email or SMS later. */
public interface OtpSender {

    void send(Member member, OtpMethod method, String code);
}
