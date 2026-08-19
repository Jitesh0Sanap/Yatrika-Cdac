package com.yatrika.servives;

import com.yatrika.entity.User;

public interface UserService {

	 User register(User user);

	 User registerHotelOwner(User user);

	    User login(String email, String password);

	    User getUserById(Long userId);

	    User updateUser(Long userId, User user);
	    
	    void forgotPassword(String email);
	    void resetPassword(String token, String newPassword);
}
