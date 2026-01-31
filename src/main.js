import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import '@fortawesome/fontawesome-free/css/all.css'
import './styles/reset.css'

const app = createApp(App)

app.config.globalProperties.$axios = axios

app.directive('click-outside', {
  beforeMount(el, binding) {
    el.__clickOutsideHandler__ = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        binding.value(e)
      }
    }
    document.addEventListener('click', el.__clickOutsideHandler__)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutsideHandler__)
    el.__clickOutsideHandler__ = null
  }
})

app.use(router)
app.mount('#app')
