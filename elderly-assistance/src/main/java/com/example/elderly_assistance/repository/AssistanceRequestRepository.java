package com.example.elderly_assistance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.elderly_assistance.entity.AssistanceRequest;
import com.example.elderly_assistance.entity.Priority;

public interface AssistanceRequestRepository
        extends JpaRepository<AssistanceRequest, Long> {

    List<AssistanceRequest> findByElderlyId(Long elderlyId);

    List<AssistanceRequest> findByVolunteerId(Long volunteerId);

    List<AssistanceRequest> findByPriority(Priority priority);
}