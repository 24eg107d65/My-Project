package com.example.elderly_assistance.controller;

import com.example.elderly_assistance.dto.RequestCreateRequest;
import com.example.elderly_assistance.entity.AssistanceRequest;
import com.example.elderly_assistance.service.RequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/elderly/{elderlyId}")
    public ResponseEntity<AssistanceRequest> createRequest(
            @PathVariable Long elderlyId,
            @RequestBody RequestCreateRequest request) {

        return ResponseEntity.ok(
                requestService.createRequest(elderlyId, request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssistanceRequest> getRequest(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                requestService.getRequestById(id)
        );
    }

    @GetMapping("/elderly/{elderlyId}")
    public ResponseEntity<List<AssistanceRequest>> getElderlyRequests(
            @PathVariable Long elderlyId) {

        return ResponseEntity.ok(
                requestService.getRequestsByElderly(elderlyId)
        );
    }

    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<AssistanceRequest>> getVolunteerRequests(
            @PathVariable Long volunteerId) {

        return ResponseEntity.ok(
                requestService.getRequestsByVolunteer(volunteerId)
        );
    }

    @PutMapping("/{requestId}/assign/{volunteerId}")
    public ResponseEntity<AssistanceRequest> assignVolunteer(
            @PathVariable Long requestId,
            @PathVariable Long volunteerId) {

        return ResponseEntity.ok(
                requestService.assignVolunteer(
                        requestId,
                        volunteerId
                )
        );
    }

    @PutMapping("/{requestId}/status")
    public ResponseEntity<AssistanceRequest> updateStatus(
            @PathVariable Long requestId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                requestService.updateStatus(
                        requestId,
                        status
                )
        );
    }

    @GetMapping("/emergency")
    public ResponseEntity<List<AssistanceRequest>> getEmergencyRequests() {

        return ResponseEntity.ok(
                requestService.getEmergencyRequests()
        );
    }
}
