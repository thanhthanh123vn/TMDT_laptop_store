package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Conversation;
import com.fit.nlu.laptop.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);


    List<Message> findByConversation_IdOrderByTimestampAsc(String conversationId);


    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.timestamp DESC")
    List<Message> findAllMessagesByUserId(@Param("userId") Long userId);
}