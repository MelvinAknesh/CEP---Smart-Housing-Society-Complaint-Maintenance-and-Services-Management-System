package com.housing.society.repository;
import com.housing.society.entity.ApprovedMember;
import com.housing.society.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ApprovedMemberRepository extends JpaRepository<ApprovedMember,Long> {
    Optional<ApprovedMember> findByPhoneAndRoleAndActiveTrue(String phone, User.Role role);
    Optional<ApprovedMember> findByPhone(String phone);
    Optional<ApprovedMember> findByEmail(String email);
}