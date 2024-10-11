package com.example.coteisreallycute.domain.user.controller;

import com.example.coteisreallycute.domain.user.dto.UserDTO;
import com.example.coteisreallycute.domain.user.model.User;
import com.example.coteisreallycute.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signUpUser(@RequestBody UserDTO userDTO) {
        try {
            User user = new User();
            user.setEmail(userDTO.getEmail());
            user.setPassword(userDTO.getPassword());
            user.setNickName(userDTO.getNickName());
            userService.signUp(user);
            return ResponseEntity.ok("회원가입이 완료되었습니다!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 실패: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserDTO userDTO) {
        try {
            User user = userService.login(userDTO.getEmail(), userDTO.getPassword());
            return ResponseEntity.ok("환영합니다. " + user.getNickName() + "님!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패: " + e.getMessage());
        }
    }
}
