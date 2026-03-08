package com.example.brainconnect.dao;

import com.example.brainconnect.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserId(Long userId);
    Optional<Room> findByCodeRoom(String code);

}
