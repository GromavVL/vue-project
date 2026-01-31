<script>
import Msg from '../Msg/Msg.vue'

export default {
  name: 'Header',
  components: {
    Msg
  },
  inject: ['appUrl', 'appUser', 'appLogout'],
  data () {
    return {
      active: false,
      menu: false
    }
  },
  methods: {
    toggleActive () {
      this.active = !this.active
    },
    toggleMenu () {
      this.menu = !this.menu
    },
    closeMenu () {
      this.menu = false
      this.active = false
    }
  }
}
</script>

<template>
  <header class="header">
    <Msg ref="msg" />

    <div class="header-content">
      <div
        class="user-section"
        v-if="appUser && appUser.user"
      >
        <div class="user-trigger" @click="toggleActive()">
          <div class="user-avatar">
            {{ appUser.user[0] }}
          </div>
          <i
            class="fas fa-caret-down arrow-icon"
            :class="{ rotated: active }"
          ></i>
        </div>

        <transition name="dropdown">
          <div class="user-dropdown" v-if="active" v-click-outside="closeMenu">
            <a href="#" @click.prevent="appLogout()" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i>
              <span>Log out ({{ appUser.user }})</span>
            </a>
          </div>
        </transition>
      </div>

      <nav class="nav-section">
        <div class="mobile-burger" @click="toggleMenu()">
          <i class="fas fa-bars"></i>
        </div>

        <div class="nav-overlay" v-if="menu" @click="closeMenu()"></div>

        <ul class="nav-list" :class="{ 'mobile-active': menu }">
          <li class="mobile-close" @click="closeMenu()">
            <i class="fas fa-times"></i>
          </li>

          <template v-if="appUser && appUser.type === 'admin'">
            <li>
              <router-link to="/users" active-class="active-link">
                <i class="fas fa-users"></i> Users
              </router-link>
            </li>
            <li>
              <router-link to="/campaigns" active-class="active-link">
                <i class="fas fa-bullhorn"></i> Campaigns
              </router-link>
            </li>
          </template>

          <template v-if="appUser && appUser.type !== 'admin'">
            <li>
              <router-link to="/statistics" active-class="active-link">
                <i class="fas fa-chart-area"></i> Statistics
              </router-link>
            </li>
            <li>
              <router-link to="/ads" active-class="active-link">
                <i class="fas fa-image"></i> Ads
              </router-link>
            </li>
            <li>
              <router-link to="/sites" active-class="active-link">
                <i class="fab fa-chrome"></i> Sites
              </router-link>
            </li>
            <li>
              <router-link to="/payments" active-class="active-link">
                <i class="fas fa-credit-card"></i> Payments
              </router-link>
            </li>
          </template>
        </ul>
      </nav>

      <div class="logo-section">
        <img
          v-if="appUrl"
          :src="appUrl + '/app/views/images/logo.svg'"
          alt="Logo"
        />
      </div>
    </div>
  </header>
</template>

<style scoped lang="sass" >
@use "./Header.module.sass"
</style>
