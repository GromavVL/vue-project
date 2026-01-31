<script>
import { createApiClient } from '../../services/api.js'
import Msg from '../../components/Msg/Msg.vue'

export default {
  name: 'Login',
  components: { Msg },
  inject: ['appUrl', 'setUser'],
  data () {
    return {
      img: 1,
      form: {
        email: '',
        password: ''
      }
    }
  },
  mounted () {
    this.img = this.randomIntFromInterval(1, 7)
  },
  methods: {
    randomIntFromInterval (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    doLogin () {
      if (!this.form.email || !this.form.password) {
        if (this.$refs.msg) this.$refs.msg.alertFun('Please fill all fields')
        else alert('Please fill all fields')
        return
      }

      const api = createApiClient(this.appUrl)
      api.login(this.form)
        .then((response) => {
          if (response.data.error) {
            if (this.$refs.msg) this.$refs.msg.alertFun(response.data.error)
            else alert(response.data.error)
          } else if (response.data.user) {
            this.setUser(response.data.user)
            this.$router.push('/campaigns')
          }
        })
        .catch((error) => {
          console.error('Login error:', error)
          if (this.$refs.msg) this.$refs.msg.alertFun('Network Error')
        })
    }
  }
}
</script>

<template>
  <div class="login-container">
    <Msg ref="msg" />

    <div id="left-area" class="image-side">
      <img
        :src="`${appUrl}/app/views/images/Cover_${img}.jpg`"
        class="bg-cover"
        alt="Cover"
      />
    </div>

    <div id="right-area" class="form-side">
      <div class="login-header">
        <div class="title-logo-wrapper">
          <div class="title">
            <h1>Affiliate Sign in</h1>
          </div>
          <div class="logo">
            <img
              :src="`${appUrl}/app/views/images/logo.svg`"
              alt="Logo"
            />
          </div>
        </div>
      </div>

      <div class="form-wrapper">
        <form @submit.prevent="doLogin">
          <div class="row">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              required
              placeholder="email@example.com"
            />
          </div>
          <div class="row">
            <label>Password</label>
            <input
              type="password"
              v-model="form.password"
              required
              autocomplete="on"
              placeholder="********"
            />
          </div>
          <div class="row btn-row">
            <button class="btn-success">SIGN IN</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@import './login.modules.sass'
</style>
