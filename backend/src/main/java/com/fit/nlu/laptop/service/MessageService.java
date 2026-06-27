package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Conversation;
import com.fit.nlu.laptop.entity.Message;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.ConversationRepository;
import com.fit.nlu.laptop.repository.MessageRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;


    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, String content, String conversationId) {
        // 1. Thay vì dùng .orElseThrow, hãy dùng logic tạo mới nếu chưa tồn tại
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseGet(() -> {
                    // Nếu chưa có, tạo hội thoại mới
                    User buyer = userRepository.findById(senderId)
                            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
                    SellerProfile seller = sellerProfileRepository.findById(receiverId)
                            .orElseThrow(() -> new RuntimeException("Seller không tồn tại"));

                    Conversation newConversation = Conversation.builder()
                            .id(conversationId)
                            .buyer(buyer)
                            .seller(seller)
                            .build();
                    return conversationRepository.save(newConversation);
                });


        conversation.setLastMessage(content);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .isRead(false)
                .isRecalled(false)
                .timestamp(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
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

        return messageRepository.save(message);
    }


    public List<Conversation> getConversationsBySellerId(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký cửa hàng!"));
            System.out.println(seller.getCccd());
        return conversationRepository.findBySellerIdOrderByLastMessageTimeDesc(seller.getId());
    }


    public List<Conversation> getConversationsByUserId(Long userId) {
        return conversationRepository.findAllByUserIdOrderByLastMessageTimeDesc(userId);
    }
}