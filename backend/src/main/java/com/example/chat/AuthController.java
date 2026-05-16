package com.example.chat;

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
    // TODO Task 6.0
}
