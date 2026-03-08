package com.example.brainconnect.service;

import com.example.brainconnect.dao.UserRepository;
import com.example.brainconnect.entity.LoginRequest;
import com.example.brainconnect.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User save(User user) {
        return userRepository.save(user);
    }

    public User signup(User user) {
        Optional<User> checkUser = userRepository.findByEmail(user.getEmail());

        if (checkUser.isPresent()) {
            return null;
        }
        return save(user);
    }

    public User login(LoginRequest loginRequest) {
        Optional<User> checkUser = userRepository.findByEmail(loginRequest.getEmail());

        if (checkUser.isEmpty()) {
            return null;
        } else if (!checkUser.get().getPassword().equals(loginRequest.getPassword())) {
            return null;
        } else {
            return checkUser.get();
        }
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateProfilePicture(Long userId, String profilePicture) {
        User user = findById(userId);
        if (user == null) {
            return null;
        }
        user.setProfilePicture(profilePicture);
        return userRepository.save(user);
    }

    // Delete a user by id
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
