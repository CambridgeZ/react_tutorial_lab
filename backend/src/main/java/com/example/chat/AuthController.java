package com.example.chat;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Lab 6 Task 6.0：实现登录 + 当前用户信息接口
//
// 要求：
//   POST /login   body: {username, password}      -> {token, username}
//                 简单 mock：username == password 才通过，否则返回 401
//   GET  /me      header: Authorization: Bearer fake-token-xxx -> {username}
//                 校验 token 前缀，提取 username 返回
//
// 提示需要的 import：
//   import org.springframework.http.HttpStatus;
//   import org.springframework.web.bind.annotation.*;
//   import org.springframework.web.server.ResponseStatusException;
//   import java.util.Map;

@org.springframework.web.bind.annotation.RestController
public class AuthController {
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username != null && username.equals(password)) {
            return Map.of(
                    "token", "fake-token-" + username,
                    "username", username
            );
        } else {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @GetMapping("/me")
    public Map<String, String> me(@org.springframework.web.bind.annotation.RequestHeader("Authorization")
                                        String authorization) {
            if (authorization != null && authorization.startsWith("fake-token-") ){
                String username = authorization.substring("fake-token-".length());
                return Map.of("username", username);
            } else {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid token");
            }
        }
}
