package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Message;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.repository.MessageRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {


    private final MessageRepository messageRepository;
    private final SellerProfileRepository sellerProfileRepository;
    // 1. Lưu tin nhắn mới
    public Message saveMessage(Message message) {
        message.setRecalled(false);
        return messageRepository.save(message);
    }

    // 2. Lấy lịch sử chat
    public List<Message> getChatHistory(String roomId) {
        return messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }


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

    public List<String> getRoomsBySellerUserId(Long sellerUserId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new RuntimeException("Tài khoản này chưa đăng ký cửa hàng!"));

        return messageRepository.findDistinctRoomIdsBySellerId(seller.getId());
    }


}