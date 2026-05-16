package com.example.chat;

// Lab 8 Task 8.0：会话 CRUD
//
// 要实现的接口（全部要鉴权：Authorization: Bearer fake-token-xxx）：
//   GET    /sessions          -> 当前用户的全部会话
//   GET    /sessions/{id}     -> 单个会话（找不到 404）
//   POST   /sessions          -> 新建（body 是 ServerSession）
//   DELETE /sessions/{id}     -> 删除
//
// 存储：内存即可，用 Map<username, List<ServerSession>>，并发安全用 ConcurrentHashMap
//
// 提示需要的 import：
//   import org.springframework.http.HttpStatus;
//   import org.springframework.web.bind.annotation.*;
//   import org.springframework.web.server.ResponseStatusException;
//   import java.util.*;
//   import java.util.concurrent.ConcurrentHashMap;

@org.springframework.web.bind.annotation.RestController
@org.springframework.web.bind.annotation.RequestMapping("/sessions")
public class SessionController {
    // TODO Task 8.0
}
