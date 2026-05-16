package com.example.chat;

// Lab 8 Task 8.0：服务端 Message。
// 跟前端的 Message 字段一致：id / role / text / createdAt
public record ServerMessage(long id, String role, String text, long createdAt) {}
