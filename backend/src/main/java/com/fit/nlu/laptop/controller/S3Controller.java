package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/images")
    public ResponseEntity<List<String>> upload(
            @RequestParam("files") MultipartFile[] files
    ) {

        List<String> urls = Arrays.stream(files)
                .map(file -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return s3Service.uploadFile(file);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }))
                .toList()
                .stream()
                .map(CompletableFuture::join)
                .toList();


        return ResponseEntity.ok(urls);
    }
}