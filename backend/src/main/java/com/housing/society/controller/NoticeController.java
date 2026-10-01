package com.housing.society.controller;
import com.housing.society.entity.Notice;
import com.housing.society.repository.NoticeRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/notices")
public class NoticeController {
    private final NoticeRepository repo;
    public NoticeController(NoticeRepository repo){this.repo=repo;}
    @GetMapping public List<Notice> all(){return repo.findByActiveTrueOrderByCreatedAtDesc();}
}