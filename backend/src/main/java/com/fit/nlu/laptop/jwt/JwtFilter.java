package com.fit.nlu.laptop.jwt;

import com.fit.nlu.laptop.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class  JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String path = req.getServletPath();

        if (path.startsWith("/api/reviews") || path.startsWith("/auth/")) {
            chain.doFilter(req, res);
            return;
        }

        String header = req.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String email = jwtUtil.getEmail(token); // Lấy email từ token

                userRepo.findByEmail(email).ifPresent(user -> {
                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
                    var principal = new UserPrincipal(
                            Math.toIntExact(user.getId()),
                            user.getEmail(),
                            authorities
                    );

                    var auth = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth); // SET AUTHENTICATION ĐÂY
                });
            } catch (Exception e) {
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        chain.doFilter(req, res);
    }


}