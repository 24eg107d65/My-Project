package com.example.elderly_assistance.service;

import com.example.elderly_assistance.dto.RequestCreateRequest;
import com.example.elderly_assistance.entity.AssistanceRequest;
import com.example.elderly_assistance.entity.Priority;
import com.example.elderly_assistance.entity.RequestStatus;
import com.example.elderly_assistance.entity.RequestType;
import com.example.elderly_assistance.entity.User;
import com.example.elderly_assistance.repository.AssistanceRequestRepository;
import com.example.elderly_assistance.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    private final AssistanceRequestRepository requestRepository;
    private final UserRepository userRepository;

    public RequestService(
            AssistanceRequestRepository requestRepository,
            UserRepository userRepository) {

        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    // Create a new assistance request
    public AssistanceRequest createRequest(
            Long elderlyId,
            RequestCreateRequest request) {

        User elderly = userRepository.findById(elderlyId)
                .orElseThrow(() ->
                        new RuntimeException("Elderly user not found"));

        AssistanceRequest assistanceRequest =
                new AssistanceRequest();

        assistanceRequest.setElderly(elderly);

        assistanceRequest.setType(
                RequestType.valueOf(
                        request.getType().toUpperCase()
                )
        );

        assistanceRequest.setDescription(
                request.getDescription()
        );

        assistanceRequest.setLocation(
                request.getLocation()
        );

        assistanceRequest.setPriority(
                Priority.valueOf(
                        request.getPriority().toUpperCase()
                )
        );

        assistanceRequest.setStatus(
                RequestStatus.PENDING
        );

        return requestRepository.save(assistanceRequest);
    }

    // Get request by ID
    public AssistanceRequest getRequestById(Long id) {

        return requestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assistance request not found"
                        )
                );
    }

    // Get all requests created by an elderly user
    public List<AssistanceRequest> getRequestsByElderly(
            Long elderlyId) {

        return requestRepository.findByElderlyId(elderlyId);
    }

    // Get requests assigned to a volunteer
    public List<AssistanceRequest> getRequestsByVolunteer(
            Long volunteerId) {

        return requestRepository.findByVolunteerId(volunteerId);
    }

    // Assign volunteer to a request
    public AssistanceRequest assignVolunteer(
            Long requestId,
            Long volunteerId) {

        AssistanceRequest request =
                getRequestById(requestId);

        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Volunteer not found"
                        )
                );

        request.setVolunteer(volunteer);

        request.setStatus(RequestStatus.ASSIGNED);

        return requestRepository.save(request);
    }

    // Update request status
    public AssistanceRequest updateStatus(
            Long requestId,
            String status) {

        AssistanceRequest request =
                getRequestById(requestId);

        request.setStatus(
                RequestStatus.valueOf(
                        status.toUpperCase()
                )
        );

        return requestRepository.save(request);
    }

    // Get emergency requests
    public List<AssistanceRequest> getEmergencyRequests() {

        return requestRepository.findByPriority(
                Priority.EMERGENCY
        );
    }
}