package com.housing.society.repository;
import com.housing.society.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    long countByRoleAndActive(User.Role role, boolean active);
}