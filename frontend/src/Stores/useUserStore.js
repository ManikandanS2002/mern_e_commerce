import {create} from 'zustand';
import axios from '../lib/axios';
import {toast} from 'react-hot-toast';

export const useUserStore = create((set,get) => ({
    user:null,
    loading:false,
    checkingAuth:true,

    signup: async ({name,email,password,confirmPassword,navigate}) => {
        set({loading:true});

        if (password !== confirmPassword) {  
            set({loading:false})
            return toast.error("Passwords Doesn't Match");
        }

        try {
            const res = await axios.post("/auth/signup",{name,email,password});
            set({user:res.data, loading:false})
            // toast.success("User Created Succesfully")
            navigate('/login')
        } catch (error) {
            set({loading:false})
            toast.error(error.response.data.message || "An error Occurred")
        }
    },

    login: async (email,password,navigate) => {
        set({loading:true});

        try {
            const res = await axios.post("/auth/login",{email,password});
            set({user:res.data, loading:false})
            console.log(res.data)
            navigate('/')
        } catch (error) {
            set({loading:false})
            toast.error(error.response.data.message || "An error Occurred")
        }
    },

    checkAuth: async () => {
        set({checkingAuth:true})
        try {
            const response = await axios.get("/auth/profile");
            console.log(response.data)
            set({user:response.data, checkingAuth:false})
        } catch (error) {
            set({checkingAuth:false,user:null})
        }
    },

    logout:async () => {
        try {
            await axios.post("/auth/logout");
            set({user:null})
        } catch (error) {
            toast.error(error.response?.data?.message || "An error Occurred during logout")
        }
    },
    refreshToken: async () => {
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},

}));

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,

    async(error) => {
        const originalRequest = error.congig;

        if(error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (refreshPromise) {
                    await refreshPromise
                    return axios(originalRequest)
                }

                refreshPromise = useUserStore.getState().refreshtoken();
                await refreshPromise;
                refreshPromise = null

                return axios(originalRequest)
            } catch (error) {
                useUserStore.getState().logout();
				return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error)
    }
)