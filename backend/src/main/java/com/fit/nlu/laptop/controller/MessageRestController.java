package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Conversation;
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


    @GetMapping("/{conversationId}")
    public ResponseEntity<List<Message>> getHistory(@PathVariable String conversationId) {
        return ResponseEntity.ok(messageService.getChatHistory(conversationId));
    }


    @GetMapping("/seller/{sellerUserId}")
    public ResponseEntity<List<Conversation>> getSellerConversations(@PathVariable Long sellerUserId) {
        return ResponseEntity.ok(messageService.getConversationsBySellerId(sellerUserId));
    }


    @GetMapping("/user/{userId}/conversations")
    public ResponseEntity<List<Conversation>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversationsByUserId(userId));
    }

}