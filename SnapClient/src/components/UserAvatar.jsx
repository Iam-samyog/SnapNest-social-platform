import React from 'react';

const UserAvatar = ({ user, className = "w-11 h-11" }) => {
    // Check for photo in user or user.profile
    const photo = user.photo || (user.profile && user.profile.photo);
    const username = user.username || 'User';
    
    if (photo) {
        return (
            <img 
                src={photo} 
                className={`${className} rounded-full object-cover border-2 border-black shadow-sm`}
                alt={username}
            />
        );
    }

    // Default Avatar: Yellow circle with bold first letter
    const firstLetter = username.charAt(0).toUpperCase();

    return (
        <div className={`${className} rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center shadow-sm select-none`}>
            <span className="text-black font-black text-lg -mb-0.5">{firstLetter}</span>
        </div>
    );
};

export default UserAvatar;
