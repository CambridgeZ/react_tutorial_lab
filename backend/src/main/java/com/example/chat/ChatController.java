package com.example.chat;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ChatController {

    /**
     * 接收前端 POST /chat 请求。
     * 请求体里前端可以传任意 JSON（比如 {"text": "..."}），
     * 这里为了简单一律返回 {"message": "hello"}。
     */
    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody(required = false) Map<String, Object> body) {
        return Map.of("message", "hello");
    }
}
