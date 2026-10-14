package org.elderlink.api;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.elderlink.model.AssistanceRequest;
import org.elderlink.model.Member;
import org.elderlink.model.Volunteer;
import org.elderlink.repository.AssistanceRequestRepository;
import org.elderlink.repository.MemberRepository;
import org.elderlink.repository.VolunteerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api")
public class NetworkController {
    private final AssistanceRequestRepository requests;
    private final VolunteerRepository volunteers;
    private final MemberRepository members;

    public NetworkController(AssistanceRequestRepository requests, VolunteerRepository volunteers,
            MemberRepository members) {
        this.requests = requests;
        this.volunteers = volunteers;
        this.members = members;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication auth) {
        String role = role(auth);
        List<AssistanceRequest> rows;
        if (role.equals("SENIOR") || role.equals("FAMILY")) {
            String memberEmail = role.equals("SENIOR") ? auth.getName() : "margaret@elderlink.org";
            rows = requests.findByRequesterOrderByCreatedAtDesc(memberEmail);
        } else if (role.equals("VOLUNTEER")) {
            Volunteer current = currentVolunteer(auth);
            rows = requests.findAllByOrderByCreatedAtDesc().stream()
                    .filter(row -> row.getStatus().equals("OPEN") || current.getId().equals(row.getVolunteerId())).toList();
        } else {
            rows = requests.findAllByOrderByCreatedAtDesc();
        }
        List<VolunteerProfile> people = volunteers.findAll().stream().map(this::profile).toList();
        long urgent = rows.stream().filter(AssistanceRequest::isEmergency)
                .filter(row -> !row.getStatus().equals("COMPLETED")).count();
        return Map.of("requests", rows, "volunteers", people,
                "stats", Map.of("open", rows.stream().filter(row -> row.getStatus().equals("OPEN")
                                || row.getStatus().equals("ASSIGNED")).count(),
                        "inProgress", rows.stream().filter(row -> row.getStatus().equals("IN_PROGRESS")).count(),
                        "completed", rows.stream().filter(row -> row.getStatus().equals("COMPLETED")).count(),
                        "urgent", urgent),
                "notifications", urgent == 0 ? List.of() : List.of("An urgent request needs community support."));
    }

    @GetMapping("/volunteers")
    public List<VolunteerProfile> allVolunteers() {
        return volunteers.findAll().stream().sorted(Comparator.comparing(Volunteer::isVerified).reversed()
                .thenComparing(Volunteer::getRating, Comparator.reverseOrder())).map(this::profile).toList();
    }

    @PostMapping("/requests")
    public AssistanceRequest createRequest(@Valid @RequestBody NewRequest input, Authentication auth) {
        String role = role(auth);
        if (!role.equals("SENIOR") && !role.equals("FAMILY")) {
            throw new AccessDeniedException("Only an older adult or family member can create a request.");
        }
        Member member = role.equals("SENIOR") ? members.findByEmail(auth.getName()).orElse(null) : null;
        if (role.equals("SENIOR") && member == null && !auth.getName().equals("margaret@elderlink.org")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Member profile not found.");
        }
        String requester = member == null ? "margaret@elderlink.org" : member.getEmail();
        String name = member == null ? "Margaret Ellis" : member.getName();
        AssistanceRequest request = new AssistanceRequest(input.title(), input.category(), input.details(),
            input.location(), requester, name, input.scheduledFor(), "OPEN", input.emergency(),
                null, null, LocalDateTime.now());
        return assignBestMatch(requests.save(request));
    }

    @GetMapping("/requests/{id}/matches")
    public List<VolunteerProfile> matches(@PathVariable Long id, Authentication auth) {
        requireRole(auth, "SENIOR", "FAMILY", "ADMIN");
        AssistanceRequest request = findRequest(id);
        ensureRequestAccess(auth, request);
        return eligibleMatches(request).stream()
                .sorted(Comparator.comparingInt((Volunteer person) -> score(person, request)).reversed()
                .thenComparing(Volunteer::getRating, Comparator.reverseOrder())).map(this::profile).toList();
    }

    @PostMapping("/requests/{id}/match")
    public AssistanceRequest match(@PathVariable Long id, Authentication auth) {
        requireRole(auth, "SENIOR", "FAMILY", "ADMIN");
        AssistanceRequest request = findRequest(id);
        ensureRequestAccess(auth, request);
        if (!request.getStatus().equals("OPEN")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been assigned.");
        }
        return assignBestMatch(request);
    }

    @PostMapping("/requests/{id}/claim")
    public AssistanceRequest claim(@PathVariable Long id, Authentication auth) {
        requireRole(auth, "VOLUNTEER");
        Volunteer current = currentVolunteer(auth);
        if (!current.isVerified() || !current.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only verified, available volunteers can claim requests.");
        }
        AssistanceRequest request = findRequest(id);
        if (!request.getStatus().equals("OPEN")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request is no longer open.");
        }
        request.setVolunteerId(current.getId());
        request.setVolunteerName(current.getName());
        request.setStatus("ASSIGNED");
        current.setAvailable(false);
        volunteers.save(current);
        return requests.save(request);
    }

    @PostMapping("/requests/{id}/decision")
    public AssistanceRequest volunteerDecision(@PathVariable Long id, @Valid @RequestBody VolunteerDecision decision,
            Authentication auth) {
        requireRole(auth, "VOLUNTEER");
        AssistanceRequest request = findRequest(id);
        Volunteer current = currentVolunteer(auth);
        if (!current.getId().equals(request.getVolunteerId()) || !request.getStatus().equals("ASSIGNED")) {
            throw new AccessDeniedException("This request is not awaiting your response.");
        }
        if (decision.accepted()) {
            request.setStatus("MATCHED");
            return requests.save(request);
        }
        request.declineVolunteer(current.getId());
        request.clearAssignment();
        request.setStatus("OPEN");
        current.setAvailable(true);
        volunteers.save(current);
        return assignBestMatch(requests.save(request));
    }

    @PatchMapping("/requests/{id}/status")
    public AssistanceRequest updateStatus(@PathVariable Long id, @RequestBody StatusUpdate update,
            Authentication auth) {
        requireRole(auth, "VOLUNTEER", "ADMIN");
        if (!List.of("IN_PROGRESS", "COMPLETED", "CANCELLED").contains(update.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported request status.");
        }
        AssistanceRequest request = findRequest(id);
        if (role(auth).equals("VOLUNTEER")) {
            Volunteer current = currentVolunteer(auth);
            if (!current.getId().equals(request.getVolunteerId())) {
                throw new AccessDeniedException("This request is assigned to another neighbor.");
            }
                boolean validTransition = (request.getStatus().equals("MATCHED") && update.status().equals("IN_PROGRESS"))
                    || (request.getStatus().equals("IN_PROGRESS") && update.status().equals("COMPLETED"));
            if (!validTransition) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "That request cannot move to the selected status.");
            }
        }
        request.setStatus(update.status());
        if (role(auth).equals("VOLUNTEER") && update.status().equals("COMPLETED")) {
            Volunteer current = currentVolunteer(auth);
            current.recordCompletion();
            current.setAvailable(true);
            volunteers.save(current);
        }
        return requests.save(request);
    }

    @PostMapping("/requests/{id}/feedback")
    public AssistanceRequest feedback(@PathVariable Long id, @RequestBody Feedback input, Authentication auth) {
        requireRole(auth, "SENIOR", "FAMILY");
        if (input.rating() < 1 || input.rating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
        }
        AssistanceRequest request = findRequest(id);
        ensureRequestAccess(auth, request);
        if (!request.getStatus().equals("COMPLETED") || request.getVolunteerId() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feedback is available after assigned help is completed.");
        }
        if (request.getRating() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feedback has already been submitted.");
        }
        request.setRating(input.rating());
        request.setFeedback(input.feedback());
        if (request.getVolunteerId() != null) {
            volunteers.findById(request.getVolunteerId()).ifPresent(volunteer -> {
                volunteer.recordRating(input.rating());
                volunteers.save(volunteer);
            });
        }
        return requests.save(request);
    }

    @PutMapping("/volunteers/{id}/verification")
    public VolunteerProfile verify(@PathVariable Long id, @RequestBody Verification input, Authentication auth) {
        requireRole(auth, "ADMIN");
        Volunteer volunteer = volunteers.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Volunteer not found."));
        volunteer.setVerified(input.verified());
        return profile(volunteers.save(volunteer));
    }

    private AssistanceRequest findRequest(Long id) {
        return requests.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
    }

    private String role(Authentication auth) {
        return auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
    }

    private Volunteer currentVolunteer(Authentication auth) {
        return volunteers.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Volunteer profile not found."));
    }

    private void ensureRequestAccess(Authentication auth, AssistanceRequest request) {
        String currentRole = role(auth);
        boolean seniorOwnsRequest = currentRole.equals("SENIOR") && auth.getName().equals(request.getRequester());
        boolean familyCanMonitorRequest = currentRole.equals("FAMILY")
                && request.getRequester().equals("margaret@elderlink.org");
        if ((currentRole.equals("SENIOR") && !seniorOwnsRequest)
                || (currentRole.equals("FAMILY") && !familyCanMonitorRequest)) {
            throw new AccessDeniedException("This request belongs to another member.");
        }
    }

    private void requireRole(Authentication auth, String... roles) {
        String current = role(auth);
        if (List.of(roles).stream().noneMatch(current::equals)) {
            throw new AccessDeniedException("This account cannot perform that action.");
        }
    }

    private int score(Volunteer volunteer, AssistanceRequest request) {
        int score = (int) (volunteer.getRating() * 4) + Math.min(volunteer.getCompleted(), 20);
        String interests = volunteer.getInterests() == null ? volunteer.getSpecialty() : volunteer.getInterests();
        if (interests != null && java.util.Arrays.stream(interests.split(","))
            .anyMatch(item -> item.trim().equalsIgnoreCase(request.getCategory()))) score += 60;
        if (volunteer.getArea().equalsIgnoreCase(request.getLocation())) score += 35;
        if (request.isEmergency()) score += volunteer.getCompleted() > 10 ? 15 : 10;
        return score;
    }

    private List<Volunteer> eligibleMatches(AssistanceRequest request) {
        return volunteers.findByAvailableTrueAndVerifiedTrue().stream()
                .filter(volunteer -> !request.hasDeclinedVolunteer(volunteer.getId())).toList();
    }

    private AssistanceRequest assignBestMatch(AssistanceRequest request) {
        Volunteer chosen = eligibleMatches(request).stream()
                .max(Comparator.comparingInt((Volunteer person) -> score(person, request))
                        .thenComparing(Volunteer::getRating)).orElse(null);
        if (chosen == null) return requests.save(request);
        request.setVolunteerId(chosen.getId());
        request.setVolunteerName(chosen.getName());
        request.setStatus("ASSIGNED");
        chosen.setAvailable(false);
        volunteers.save(chosen);
        return requests.save(request);
    }

    private VolunteerProfile profile(Volunteer volunteer) {
        return new VolunteerProfile(volunteer.getId(), volunteer.getName(), volunteer.getSpecialty(),
                volunteer.getInterests(), volunteer.getBio(), volunteer.getArea(), volunteer.getRating(),
                volunteer.getCompleted(), volunteer.isAvailable(), volunteer.isVerified());
    }

    public record NewRequest(@NotBlank String title, @NotBlank String category, String details,
            @NotBlank String location, String scheduledFor, boolean emergency) {}
        public record VolunteerProfile(Long id, String name, String specialty, String interests, String bio,
            String area, double rating,
            int completed, boolean available, boolean verified) {}
    public record StatusUpdate(String status) {}
    public record Feedback(int rating, String feedback) {}
    public record Verification(boolean verified) {}
    public record VolunteerDecision(boolean accepted) {}
}