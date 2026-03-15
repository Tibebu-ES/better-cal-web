import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
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
