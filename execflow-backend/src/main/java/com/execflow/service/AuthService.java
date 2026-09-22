package com.execflow.service;

import com.execflow.dto.request.LoginRequest;
import com.execflow.dto.request.RegisterRequest;
import com.execflow.dto.response.AuthResponse;
import com.execflow.entity.User;
import com.execflow.exception.EmailAlreadyExistsException;
import com.execflow.exception.InvalidCredentialsException;
import com.execflow.mapper.UserMapper;
import com.execflow.repository.UserRepository;
import com.execflow.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import com.execflow.exception.ApiException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final String registrationSecret;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserMapper userMapper,
            @Value("${execflow.auth.registration-secret}") String registrationSecret
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.registrationSecret = registrationSecret;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Registration is invite-only: the caller must supply the secret
        // code configured via REGISTRATION_SECRET. There is no public
        // sign-up - only the owner hands this code out.
        if (registrationSecret == null || registrationSecret.isBlank()
                || !registrationSecret.equals(request.inviteCode())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid invite code");
        }

        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .build();

        User saved = userRepository.save(user);

        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail());
        return new AuthResponse(token, jwtUtil.getExpirationMs(), userMapper.toResponse(user));
    }
}
