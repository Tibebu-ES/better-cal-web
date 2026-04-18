import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(config => {
    const accessKey = localStorage.getItem('access_key')
    if(accessKey && config.headers) config.headers['X-Access-Key'] = accessKey
    return config
})

export default api
