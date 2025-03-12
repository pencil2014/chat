import axios from 'axios'

const service = axios.create({
  baseURL: '/',
  timeout: 1500000
});

service.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${import.meta.env.VITE_DEEPSEEK_KEY}`
  config.headers['Content-Type'] = 'application/json'
  return config
})

export default service
