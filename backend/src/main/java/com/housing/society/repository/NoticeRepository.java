package com.housing.society.repository;
import com.housing.society.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NoticeRepository extends JpaRepository<Notice,Long> {
    List<Notice> findByActiveTrueOrderByCreatedAtDesc();
}