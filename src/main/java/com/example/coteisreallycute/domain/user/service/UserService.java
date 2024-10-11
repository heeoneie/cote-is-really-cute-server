package com.example.coteisreallycute.domain.user.service;

import com.example.coteisreallycute.domain.user.model.User;

public interface UserService {
    User signUp(User user);
    User login(String email, String password);
}
