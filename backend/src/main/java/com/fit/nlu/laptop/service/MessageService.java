package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.*;
import com.fit.nlu.laptop.repository.ConversationRepository;
import com.fit.nlu.laptop.repository.MessageRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Message sendMessage(
            Long senderId,
            Long receiverId,
            String content,
            String conversationId,
            List<String> imageUrls,
            String videoUrl,
            Long productId,
            Long orderId
    ) {

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseGet(() -> {
                    User buyer = userRepository.findById(senderId)
                            .orElseThrow(() -> new RuntimeException("User không tồn tại"));

                    SellerProfile seller = sellerProfileRepository.findById(receiverId)
                            .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

                    Conversation newConversation = Conversation.builder()
                            .id(conversationId)
                            .buyer(buyer)
                            .seller(seller)
                            .build();

                    return conversationRepository.saveAndFlush(newConversation);
                });


        String lastMessageDisplay = (content != null && !content.trim().isEmpty())
                ? content
                : (!imageUrls.isEmpty() || videoUrl != null) ? "[Hình ảnh/Video]" : "[File]";

        conversation.setLastMessage(lastMessageDisplay);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversationRepository.saveAndFlush(conversation);

        // Khởi tạo Message
        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .productId(productId)
                .orderId(orderId)
                .isRead(false)
                .isRecalled(false)
                .timestamp(LocalDateTime.now())
                .build();


        List<MessageMedia> mediaList = new ArrayList<>();


        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String url : imageUrls) {
                MessageMedia media = new MessageMedia();
                media.setUrl(url);
                media.setType(getFileType(url));
                media.setMessage(message);
                mediaList.add(media);
            }
        }


        if (videoUrl != null && !videoUrl.trim().isEmpty()) {
            MessageMedia media = new MessageMedia();
            media.setUrl(videoUrl);
            media.setType("VIDEO");
            media.setMessage(message);
            mediaList.add(media);
        }


        if (!mediaList.isEmpty()) {
            message.setMedia(mediaList);
        }

        return messageRepository.save(message);
    }
    private String getFileType(String url){

        String lower = url.toLowerCase();


        if(lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".png")
                || lower.endsWith(".webp")){

            return "IMAGE";
        }


        if(lower.endsWith(".mp4")
                || lower.endsWith(".mov")
                || lower.endsWith(".avi")){

            return "VIDEO";
        }


        return "FILE";
    }
    public List<Message> getChatHistory(String conversationId) {
        return messageRepository.findByConversation_IdOrderByTimestampAsc(conversationId);
    }

    @Transactional
    public Message recallMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thu hồi tin nhắn này");
        }

        message.setRecalled(true);
        message.setContent("Tin nhắn đã bị thu hồi");

        message.setMedia(new ArrayList<>());

        return messageRepository.save(message);
    }

    public List<Conversation> getConversationsBySellerId(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký cửa hàng!"));
        return conversationRepository.findBySellerIdOrderByLastMessageTimeDesc(seller.getId());
    }

    public List<Conversation> getConversationsByUserId(Long userId) {
        return conversationRepository.findAllByUserIdOrderByLastMessageTimeDesc(userId);
    }
}