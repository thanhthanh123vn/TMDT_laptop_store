package com.fit.nlu.laptop.dto.request;

import lombok.Data;

import java.util.List;



@Data
public class ChatMessageRequest {
    private Long senderId;
    private Long receiverId;
    private String content;
    private List<String> imageUrls;
    private String videoUrl;
    private Long productId;
    private Long orderId;
}