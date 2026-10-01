package com.housing.society.service;

import com.housing.society.entity.Complaint;
import java.util.Map;

public final class SlaService {
    private SlaService(){}
    public record Rule(Complaint.Priority priority,int slaHours,int escalationHours){}
    private static final Map<String,Rule> RULES=Map.of(
        "GAS LEAKAGE",new Rule(Complaint.Priority.EMERGENCY,4,1),
        "ELECTRICAL SHORT CIRCUIT",new Rule(Complaint.Priority.EMERGENCY,4,1),
        "MAJOR WATER LEAKAGE",new Rule(Complaint.Priority.HIGH,12,6),
        "LIFT MALFUNCTION",new Rule(Complaint.Priority.HIGH,12,6),
        "NORMAL PLUMBING ISSUE",new Rule(Complaint.Priority.MEDIUM,24,12),
        "CLEANING REQUEST",new Rule(Complaint.Priority.LOW,48,24),
        "MINOR MAINTENANCE",new Rule(Complaint.Priority.LOW,72,48)
    );
    public static Rule ruleFor(String category){
        Rule r=RULES.get(category.trim().toUpperCase());
        if(r!=null) return r;
        return new Rule(Complaint.Priority.MEDIUM,24,12);
    }
}