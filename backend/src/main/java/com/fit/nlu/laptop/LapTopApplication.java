package com.fit.nlu.laptop;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableScheduling
public class LapTopApplication {

	public static void main(String[] args) {
		SpringApplication.run(LapTopApplication.class, args);
	}

}
