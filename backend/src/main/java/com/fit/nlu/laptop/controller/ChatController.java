package com.fit.nlu.laptop.controller;
import com.fit.nlu.laptop.entity.Message;
import com.fit.nlu.laptop.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
@RequiredArgsConstructor
@Controller
public class ChatController {


    private final SimpMessagingTemplate messagingTemplate;


    private final MessageService messageService;

    // API 1: Lắng nghe client GỬI tin nhắn mới
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable String roomId, @Payload Message message) {
        message.setRoomId(roomId);

        // Lưu vào DB
        Message savedMessage = messageService.saveMessage(message);

        // Phát (Broadcast) tin nhắn đã lưu (có kèm ID) cho cả User và Shop
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
    }

    // API 2: Lắng nghe client yêu cầu THU HỒI tin nhắn
    @MessageMapping("/chat/{roomId}/recall")
    public void recallMessage(@DestinationVariable String roomId, @Payload Map<String, Long> payload) {
        Long messageId = payload.get("messageId");
        Long senderId = payload.get("senderId");

        try {
            // Cập nhật DB
            Message recalledMsg = messageService.recallMessage(messageId, senderId);

            // Phát lại chính tin nhắn đó (nhưng status isRecalled = true) để Frontend update UI
            messagingTemplate.convertAndSend("/topic/chat/" + roomId, recalledMsg);

        } catch (Exception e) {
            System.err.println("Lỗi thu hồi: " + e.getMessage());
        }
    }
}