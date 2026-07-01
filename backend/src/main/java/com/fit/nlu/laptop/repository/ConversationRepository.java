package com.fit.nlu.laptop.repository;


import com.fit.nlu.laptop.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {


    @Query("SELECT c FROM Conversation c WHERE c.buyer.id = :userId OR c.seller.id = :userId ORDER BY c.lastMessageTime DESC")
    List<Conversation> findAllByUserIdOrderByLastMessageTimeDesc(Long userId);



    @Query("SELECT c FROM Conversation c WHERE  c.seller.id = :sellerId ORDER BY c.lastMessageTime DESC")
    List<Conversation> findBySellerIdOrderByLastMessageTimeDesc(Long sellerId);


    @Query("SELECT c FROM Conversation c WHERE (c.buyer.id = :buyerId AND c.seller.id = :sellerId) OR (c.buyer.id = :sellerId AND c.seller.id = :buyerId)")
    Optional<Conversation> findExistingConversation(Long buyerId, Long sellerId);
}