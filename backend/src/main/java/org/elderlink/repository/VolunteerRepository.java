package org.elderlink.repository;

import java.util.List;

import org.elderlink.model.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    List<Volunteer> findByAvailableTrueAndVerifiedTrue();
    java.util.Optional<Volunteer> findByEmail(String email);
    boolean existsByEmail(String email);
}