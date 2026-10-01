package com.housing.society.service;

import com.housing.society.dto.AuthDtos.*;
import com.housing.society.entity.*;
import com.housing.society.repository.*;
import com.housing.society.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users; private final ResidentRepository residents;
    private final WorkerRepository workers; private final ApprovedMemberRepository approved;
    private final PasswordEncoder encoder; private final JwtService jwt;

    public AuthService(UserRepository users,ResidentRepository residents,WorkerRepository workers,
                       ApprovedMemberRepository approved,PasswordEncoder encoder,JwtService jwt){
        this.users=users;this.residents=residents;this.workers=workers;this.approved=approved;
        this.encoder=encoder;this.jwt=jwt;
    }

    public LoginResponse register(RegisterRequest r){
        User.Role role;
        try { role=User.Role.valueOf(r.role().toUpperCase()); }
        catch(Exception e){throw new IllegalArgumentException("Role must be RESIDENT, WORKER or ADMIN");}

        if(users.findByEmail(r.email()).isPresent() || users.findByPhone(r.phone()).isPresent())
            throw new IllegalArgumentException("Email or phone already registered");

        if(role!=User.Role.ADMIN){
            ApprovedMember m=approved.findByPhoneAndRoleAndActiveTrue(r.phone(),role)
                .orElseThrow(()->new IllegalArgumentException("Phone is not in the approved member list"));
            if(m.isRegistered()) throw new IllegalArgumentException("This approved member is already registered");
        }

        User u=new User(null,r.name(),r.email(),encoder.encode(r.password()),r.phone(),role,true);
        users.save(u);

        if(role==User.Role.RESIDENT){
            residents.save(new Resident(null,u,r.wing(),r.flatNumber(),r.blockNumber(),
                    r.ownershipStatus(),r.familyMembers()));
        } else if(role==User.Role.WORKER){
            String spec=r.specialization();
            if(spec==null && approved.findByPhone(r.phone()).isPresent())
                spec=approved.findByPhone(r.phone()).get().getSpecialization();
            workers.save(new Worker(null,u,spec,true,null));
        }
        approved.findByPhone(r.phone()).ifPresent(m->{m.setRegistered(true);approved.save(m);});
        return loginInternal(u);
    }

    public LoginResponse login(LoginRequest r){
        User u=users.findByEmail(r.email()).orElseThrow(()->new IllegalArgumentException("Invalid email or password"));
        if(!u.isActive() || !encoder.matches(r.password(),u.getPassword()))
            throw new IllegalArgumentException("Invalid email or password");
        return loginInternal(u);
    }

    private LoginResponse loginInternal(User u){
        return new LoginResponse(jwt.generate(u.getEmail(),u.getRole().name()),
                u.getId(),u.getName(),u.getEmail(),u.getRole().name());
    }
}