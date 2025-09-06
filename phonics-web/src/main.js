import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)  // 先创建应用实例
app.use(router)             // 挂载路由
app.mount('#app')           // 挂载到 DOM