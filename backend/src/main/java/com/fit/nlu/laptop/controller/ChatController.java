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

import java.time.LocalDateTime;
import java.util.Map;
@RequiredArgsConstructor
@Controller
public class ChatController {


    private final SimpMessagingTemplate messagingTemplate;


    private final MessageService messageService;
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable String roomId, @Payload Message message) {
        message.setRoomId(roomId);


        message.setTimestamp(LocalDateTime.now());


        Message savedMessage = messageService.saveMessage(message);


        messagingTemplate.convertAndSend("/topic/chat/" + roomId, savedMessage);
    }


    @MessageMapping("/chat/{roomId}/recall")
    public void recallMessage(@DestinationVariable String roomId, @Payload Map<String, Long> payload) {
        Long messageId = payload.get("messageId");
        Long senderId = payload.get("senderId");

        try {

            Message recalledMsg = messageService.recallMessage(messageId, senderId);


            messagingTemplate.convertAndSend("/topic/chat/" + roomId, recalledMsg);

        } catch (Exception e) {
            System.err.println("Lỗi thu hồi: " + e.getMessage());
        }
    }
}