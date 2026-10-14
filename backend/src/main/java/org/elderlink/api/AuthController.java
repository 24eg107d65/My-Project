package org.elderlink.api;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.elderlink.model.Member;
import org.elderlink.model.Volunteer;
import org.elderlink.repository.MemberRepository;
import org.elderlink.repository.VolunteerRepository;
import org.elderlink.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String SENIOR = "SENIOR";
    private static final String FAMILY = "FAMILY";
    private static final String VOLUNTEER = "VOLUNTEER";
    private static final String ADMIN = "ADMIN";
    private static final Set<String> DEMO_ROLES = Set.of(SENIOR, FAMILY, VOLUNTEER, ADMIN);

    private final JwtService jwtService;
    private final MemberRepository members;
    private final VolunteerRepository volunteers;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtService jwtService, MemberRepository members, VolunteerRepository volunteers,
            PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.members = members;
        this.volunteers = volunteers;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody Registration input) {
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (members.existsByEmail(email) || volunteers.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already uses this email.");
        }
        String encodedPassword = passwordEncoder.encode(input.password());
        if (input.role().equalsIgnoreCase(VOLUNTEER)) {
            if (input.interests() == null || input.interests().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one kind of help.");
            }
            String interests = input.interests().stream().distinct().collect(Collectors.joining(", "));
                volunteers.save(new Volunteer(input.name().trim(), email, encodedPassword,
                    input.phone().trim(), input.bio() == null ? "" : input.bio().trim(), interests, input.area().trim()));
                return Map.of("message", "Helper account created. Sign in to continue.", "role", VOLUNTEER,
                    "verified", false);
        }
        if (!input.role().equalsIgnoreCase(SENIOR)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a supported account type.");
        }
        members.save(new Member(input.name().trim(), email, encodedPassword, input.phone().trim(), input.area().trim()));
        return Map.of("message", "Account created. Sign in to continue.", "role", SENIOR, "verified", true);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody Login input) {
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        return members.findByEmail(email).map(member -> {
            if (!passwordEncoder.matches(input.password(), member.getPasswordHash())) invalidCredentials();
            return session(email, SENIOR, member.getName(), true);
        }).orElseGet(() -> volunteers.findByEmail(email).map(volunteer -> {
            if (!passwordEncoder.matches(input.password(), volunteer.getPasswordHash())) invalidCredentials();
            return session(email, VOLUNTEER, volunteer.getName(), volunteer.isVerified());
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.")));
    }

    private void invalidCredentials() {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
    }

    private Map<String, Object> session(String email, String role, String name, boolean verified) {
        return Map.of("token", jwtService.issue(email, role, name), "email", email, "name", name,
                "role", role, "verified", verified);
    }

    @PostMapping("/demo")
    public Map<String, String> demoLogin(@RequestBody Map<String, String> body) {
        String role = String.valueOf(body.getOrDefault("role", SENIOR)).toUpperCase(Locale.ROOT);
        if (!DEMO_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid account role.");
        }
        String email = switch (Objects.requireNonNull(role)) {
            case FAMILY -> "family@elderlink.org";
            case VOLUNTEER -> "alex@elderlink.org";
            case ADMIN -> "admin@elderlink.org";
            default -> "margaret@elderlink.org";
        };
        String name = switch (Objects.requireNonNull(role)) {
            case FAMILY -> "Nina Patel";
            case VOLUNTEER -> "Alex Morgan";
            case ADMIN -> "Jordan Lee";
            default -> "Margaret Ellis";
        };
        return Map.of("token", jwtService.issue(email, role, name), "email", email, "name", name, "role", role);
    }

    public record Registration(@NotBlank @Size(max = 100) String name, @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password, @NotBlank String role,
            @NotBlank String phone, @NotBlank String area, List<String> interests, @Size(max = 1000) String bio) {}
    public record Login(@NotBlank @Email String email, @NotBlank String password) {}
}