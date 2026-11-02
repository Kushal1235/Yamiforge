CREATE TABLE members (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username   VARCHAR(30)  NOT NULL UNIQUE,
    phone      VARCHAR(10)  NOT NULL UNIQUE,
    email      VARCHAR(254) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE otp_codes (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    member_id  BIGINT       NOT NULL REFERENCES members (id) ON DELETE CASCADE,
    code_hash  VARCHAR(100) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    attempts   INT          NOT NULL DEFAULT 0
);

CREATE INDEX otp_codes_member_idx ON otp_codes (member_id);
