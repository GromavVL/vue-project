<script>
import { computed } from 'vue'

export default {
  data () {
    return {
      url: 'https://affiliate.yanbasok.com',
      user: { name: '', phone: '', email: '', date: '', auth: '' },
      title: ''
    }
  },
  provide () {
    return {
      appUrl: computed(() => this.url),
      appUser: computed(() => this.user),
      appLogout: this.logout,
      setUser: (userData) => {
        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
      }
    }
  },
  watch: {
    $route () {
      this.init()
    }
  },
  created () {
    this.init()
  },

  methods: {
    init () {
      const localUser = window.localStorage.getItem('user')
      if (localUser) {
        try {
          this.user = JSON.parse(localUser)
        } catch (e) {
          console.warn('Bad user in localStorage:', localUser)
        }
      }

      const currentPath = this.$route.path
      if (!this.user.auth && currentPath !== '/') {
        this.$router.push('/')
      }
    },
    logout () {
      this.user = { name: '', phone: '', email: '', date: '', auth: '' }
      window.localStorage.setItem('user', '')
      this.$router.push('/')
    }
  }
}
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style></style>
