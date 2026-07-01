package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.request.ChatMessageRequest;
import com.fit.nlu.laptop.entity.Message;
import com.fit.nlu.laptop.service.MessageService;
import lombok.RequiredArgsConstructor;
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



    @MessageMapping("/chat/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable String conversationId,
            @Payload ChatMessageRequest request
    ) {


        Message savedMessage = messageService.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getContent(),
                conversationId,
                request.getImageUrls(),
                request.getVideoUrl(),
                request.getProductId(),
                request.getOrderId()
        );

        // Gửi trả lại Entity Message đã được lưu hoàn chỉnh cho các client trong phòng
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, savedMessage);
    }
    @MessageMapping("/chat/{conversationId}/recall")
    public void recallMessage(@DestinationVariable String conversationId, @Payload Map<String, Long> payload) {
        Long messageId = payload.get("messageId");
        Long senderId = payload.get("senderId");

        try {
            Message recalledMsg = messageService.recallMessage(messageId, senderId);
            messagingTemplate.convertAndSend("/topic/chat/" + conversationId, recalledMsg);
        } catch (Exception e) {
            System.err.println("Lỗi thu hồi: " + e.getMessage());
        }
    }
}