package org.elderlink.config;

import java.time.LocalDateTime;

import org.elderlink.model.AssistanceRequest;
import org.elderlink.model.Volunteer;
import org.elderlink.repository.AssistanceRequestRepository;
import org.elderlink.repository.VolunteerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoData {
    @Bean
    CommandLineRunner seed(VolunteerRepository volunteers, AssistanceRequestRepository requests) {
        return args -> {
            if (volunteers.count() == 0) {
                volunteers.save(new Volunteer("Alex Morgan", "alex@elderlink.org", "Transport", "Riverside", 4.9, 38, true, true));
                volunteers.save(new Volunteer("Priya Shah", "priya@elderlink.org", "Groceries", "Riverside", 4.8, 24, true, true));
                volunteers.save(new Volunteer("Daniel Kim", "daniel@elderlink.org", "Medicine", "Oakwood", 4.9, 51, true, true));
                volunteers.save(new Volunteer("Sam Rivera", "sam@elderlink.org", "Digital support", "Riverside", 4.7, 17, true, true));
                volunteers.save(new Volunteer("Taylor Brooks", "taylor@elderlink.org", "Hospital visit", "Oakwood", 4.6, 12, false, false));
            }
            if (requests.count() == 0) {
                requests.save(new AssistanceRequest("Prescription pickup", "Medicine", "Collect my weekly prescription from the pharmacy.", "Oakwood", "margaret@elderlink.org", "Margaret Ellis", "Today, 2:30 PM", "MATCHED", true, 3L, "Daniel Kim", LocalDateTime.now().minusHours(1)));
                requests.save(new AssistanceRequest("Fresh groceries", "Groceries", "A few essentials from the neighborhood market.", "Riverside", "margaret@elderlink.org", "Margaret Ellis", "Today, 4:00 PM", "OPEN", false, null, null, LocalDateTime.now().minusHours(3)));
                requests.save(new AssistanceRequest("Clinic appointment", "Transport", "A ride to my clinic appointment and back.", "Riverside", "margaret@elderlink.org", "Margaret Ellis", "Tomorrow, 10:00 AM", "IN_PROGRESS", false, 1L, "Alex Morgan", LocalDateTime.now().minusDays(1)));
                requests.save(new AssistanceRequest("Video call setup", "Digital support", "Help me connect to a video call with my family.", "Riverside", "margaret@elderlink.org", "Margaret Ellis", "Friday, 11:00 AM", "COMPLETED", false, 4L, "Sam Rivera", LocalDateTime.now().minusDays(4)));
            }
        };
    }
}