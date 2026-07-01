package com.fit.nlu.laptop.config;

import com.fit.nlu.laptop.jwt.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; " +
                                                // SCRIPT
                                                "script-src 'self' https://js.stripe.com 'unsafe-inline'; " +
                                                // FRAME
                                                "frame-src https://js.stripe.com https://hooks.stripe.com; " +
                                                // STYLE
                                                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                                                // FONT
                                                "font-src 'self' https://fonts.gstatic.com; " +
                                                // CONNECT - Đã bổ sung ws://localhost:8080 để kết nối Chat Realtime
                                                "connect-src 'self' http://localhost:8080 ws://localhost:8080 https://api.stripe.com https://m.stripe.network;"
                                )
                        )
                )
                .sessionManagement(s ->
                        s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/seller/**").hasRole("SELLER")

                        // Cho phép kết nối WebSockets (Chat) tự do
                        .requestMatchers("/ws/**").permitAll()

                        .requestMatchers("/api/products/seller/**").permitAll()

                        .requestMatchers(
                                "/api/cart/**",
                                "/api/orders/**",
                                "/api/reviews/**",
                                "/api/notifications/**",
                                "/api/chat/**",
                                "/api/upload/**",
                                "/api/seller/stats"

                        ).authenticated()

                        .requestMatchers(
                                "/auth/**",
                                "/uploads/**",
                                "/error",
                                "/api/payment/**",
                                "/api/payment/webhook",
                                "/api/addresses",

                                "/api/home",
                                "/api/products/**",
                                "/api/categories/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS",
                        "HEAD",
                        "PATCH"
                )
        );
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }


    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}