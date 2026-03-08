package com.example.brainconnect.ws;

import com.example.brainconnect.dto.CanvasUpdateDTO;
import com.example.brainconnect.entity.Room;
import com.example.brainconnect.entity.User;
import com.example.brainconnect.service.RoomService;
import com.example.brainconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/rooms")
public class RoomController {

    @Autowired
    private RoomService service;
    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    // Save a new room
    @PostMapping("/save/{userId}")
    public ResponseEntity<?> saveRoom(@RequestBody Room room, @PathVariable String userId) {
        try {
            Long userIdLong = Long.parseLong(userId);
            User user = userService.findById(userIdLong);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with id: " + userId);
            }

            Room savedRoom = service.save(room, user);
            return ResponseEntity.ok(savedRoom);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid user ID format: " + userId);
        }
    }


    @PostMapping("/saveRoomState/{roomId}")
    public int saveRoomState(@PathVariable Long roomId, @RequestBody String stageData) {
      return  service.saveRoomState(roomId, stageData);
    }

    // Delete a room by its code
    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteRoomByCode(@PathVariable String code) {
        boolean deleted = service.deleteByCode(code);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("deleted", false, "message", "Room not found"));
        }
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    //Get Rooms By User Id
    @GetMapping("/user/{userId}")
    public List<Room> getRoomsByUserId(@PathVariable Long userId) {
        return service.findByUserId(userId);
    }

    //Get Room data By Room Id
    @GetMapping("/room/{roomId}")
    public Room getRoom(@PathVariable Long roomId) {
        return service.findById(roomId);
    }


    @MessageMapping("/canvas/update")
    @SendTo("/topic/room/{roomId}")
    public CanvasUpdateDTO handleCanvasUpdate(@Payload CanvasUpdateDTO update) {
        // Save the canvas state
        service.saveRoomState(update.getRoomId(), update.getCanvasData());
        return update;
    }

    @GetMapping("/roomCode/{roomCode}")
    public ResponseEntity<?> getRoomByCode(@PathVariable String roomCode) {
        Long roomId = service.findByCode(roomCode);
        if (roomId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Room code does not exist"));
        }
        return ResponseEntity.ok(roomId);
    }

}

