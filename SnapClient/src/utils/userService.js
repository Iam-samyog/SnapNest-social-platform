import axiosInstance from './axiosInstance';

const userService = {
    followUser: async (username) => {
        try {
            const response = await axiosInstance.post(`/users/${username}/follow/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unfollowUser: async (username) => {
        try {
            const response = await axiosInstance.post(`/users/${username}/unfollow/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    getUserProfile: async (username) => {
        try {
            const response = await axiosInstance.get(`/users/${username}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getFollowers: async (username) => {
        try {
            const response = await axiosInstance.get(`/users/${username}/followers/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getFollowing: async (username) => {
        try {
            const response = await axiosInstance.get(`/users/${username}/following/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
