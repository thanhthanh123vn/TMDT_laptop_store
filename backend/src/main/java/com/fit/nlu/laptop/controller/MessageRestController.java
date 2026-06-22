package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Message;
import com.fit.nlu.laptop.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class MessageRestController {

    private final MessageService messageService;


    @GetMapping("/{roomId}")
    public ResponseEntity<List<Message>> getHistory(@PathVariable String roomId) {
        return ResponseEntity.ok(messageService.getChatHistory(roomId));
    }


    @GetMapping("/seller/{sellerUserId}")
    public ResponseEntity<List<String>> getSellerRooms(@PathVariable Long sellerUserId) {
        return ResponseEntity.ok(messageService.getRoomsBySellerUserId(sellerUserId));
    }
}