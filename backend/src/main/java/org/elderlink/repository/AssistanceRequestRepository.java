package org.elderlink.repository;

import java.util.List;
import org.elderlink.model.AssistanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, Long> {
    List<AssistanceRequest> findByRequesterOrderByCreatedAtDesc(String requester);
    List<AssistanceRequest> findAllByOrderByCreatedAtDesc();
}