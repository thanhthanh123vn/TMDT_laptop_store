package com.fit.nlu.laptop.dto.response;

public record AuthResponse(
		String token,
		String refreshToken,
		String email,
		String fullName,
		String provider
) {
}

