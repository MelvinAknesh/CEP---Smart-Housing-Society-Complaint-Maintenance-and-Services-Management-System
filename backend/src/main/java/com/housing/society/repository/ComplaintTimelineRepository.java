package com.housing.society.repository;
import com.housing.society.entity.ComplaintTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ComplaintTimelineRepository extends JpaRepository<ComplaintTimeline,Long> {
    List<ComplaintTimeline> findByComplaintIdOrderByTimestampAsc(Long complaintId);
}