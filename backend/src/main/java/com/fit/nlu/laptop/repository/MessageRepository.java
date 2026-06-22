package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByRoomIdOrderByTimestampAsc(String roomId);
    @Query("SELECT DISTINCT m.roomId FROM Message m WHERE m.roomId LIKE CONCAT('%_seller_', :sellerId, '_%')")
    List<String> findDistinctRoomIdsBySellerId(@Param("sellerId") Long sellerId);
}