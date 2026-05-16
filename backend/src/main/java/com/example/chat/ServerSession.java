package com.example.chat;

import java.util.List;

// Lab 8 Task 8.0 用：Session 数据结构（后端版）
// 简单 record，跟前端 ServerSession 对应。
public record ServerSession(String id, long createdAt, List<ServerMessage> messages) {}
