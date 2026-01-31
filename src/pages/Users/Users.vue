<script>
import { createApiClient } from '../../services/api.js'

import Header from '../../components/Header/Header.vue'
import Popup from '../../components/Popup/Popup.vue'
import Toogle from '../../components/Toogle/Toogle.vue'
import loaderGif from '../../images/loader.gif'

export default {
  name: 'Users',
  components: { Header, Popup, Toogle },
  inject: ['appUrl', 'appUser', 'appLogout'],
  data () {
    return {
      formData: {},
      loaderGif,
      data: { items: [] },
      q: '',
      sort: '',
      loader: 1
    }
  },
  computed: {
    api () {
      return createApiClient(this.appUrl, this.appUser ? this.appUser.auth : '')
    }
  },
  mounted () {
    if (this.appUser && !this.appUser.auth) {
      this.appLogout()
      return
    }
    this.get()
  },
  methods: {
    get () {
      this.loader = 1

      if (!this.appUrl) {
        console.log('URL API not found')
        this.loader = 0
        return
      }

      this.api.getUsers({
        q: this.q,
        sort: this.sort
      })
        .then((response) => {
          this.data = response.data
          this.loader = 0
        })
        .catch((error) => {
          if (error.isApiError) {
            console.error(error.message)
          } else {
            console.error(error)
            this.appLogout()
          }
          this.loader = 0
        })
    },

    action () {
      if (!this.formData) return

      this.api.actionUser(this.formData)
        .then((response) => {
          if (this.$refs.new) this.$refs.new.active = 0

          if (this.$refs.header && this.$refs.header.$refs.msg) {
            if (this.formData.id) {
              this.$refs.header.$refs.msg.successFun(
                'Successfully updated user!'
              )
            } else {
              this.$refs.header.$refs.msg.successFun(
                'Successfully added new user!'
              )
            }
          }
          this.get()
        })
        .catch((error) => {
          if (error.isApiError && this.$refs.header && this.$refs.header.$refs.msg) {
            this.$refs.header.$refs.msg.alertFun(error.message)
          } else {
            console.log('errors', error)
          }
        })
    },

    async del (item) {
      this.formData = item

      if (this.$refs.header && this.$refs.header.$refs.msg) {
        if (
          await this.$refs.header.$refs.msg.confirmFun(
            'Please confirm next action',
            'Do you want to delete this user?'
          )
        ) {
          this.api.deleteUser(this.formData)
            .then((response) => {
              this.$refs.header.$refs.msg.successFun(
                'Successfully deleted user!'
              )
              this.get()
            })
            .catch((error) => {
              if (error.isApiError) {
                this.$refs.header.$refs.msg.alertFun(error.message)
              } else {
                console.log('errors', error)
              }
            })
        }
      }
    }
  }
}
</script>

<template>
  <div class="page-container">
    <Header ref="header" />

    <div id="spinner" v-if="loader">
      <img :src="loaderGif" alt="Loading..." />
    </div>

    <div class="content-wrapper">
      <div class="toolbar">
        <div class="toolbar-left">
          <a
            class="btn-primary"
            href="#"
            @click.prevent=";(formData = {}), ($refs.new.active = 1)"
          >
            <i class="fas fa-plus"></i> New
          </a>
        </div>

        <div class="toolbar-center">
          <input
            type="text"
            placeholder="Search..."
            v-model="q"
            @keyup="get()"
            class="search-input"
          />
        </div>

        <div class="toolbar-right">
          <h1 class="page-title">Users</h1>
        </div>
      </div>

      <Popup
        ref="new"
        :title="
          formData && formData.id
            ? 'Edit user'
            : 'New user'
        "
      >
        <div class="form-container">
          <form @submit.prevent="action()" v-if="formData">
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                v-model="formData.name"
                required
                placeholder="Enter name..."
                class="text-input"
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                v-model="formData.email"
                required
                placeholder="Enter email..."
                class="text-input"
              />
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input
                type="text"
                v-model="formData.phone"
                placeholder="Enter phone..."
                class="text-input"
              />
            </div>

            <div class="form-actions">
              <button
                class="btn-primary"
                v-if="formData && formData.id"
              >
                Save Changes
              </button>
              <button
                class="btn-primary"
                v-if="formData && !formData.id"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table-container" v-if="data.items && data.items.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">#</th>
              <th class="col-toggle">Status</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="col-id">{{ item.id }}</td>
              <td class="col-toggle">
                <Toogle
                  v-model="item.published"
                  @update:modelValue=";(formData = item), action()"
                />
              </td>
              <td class="col-name">
                <router-link :to="'/user/' + item.id" class="link-primary">
                  {{ item.name }}
                </router-link>
              </td>
              <td>{{ item.email }}</td>
              <td>{{ item.phone }}</td>
              <td class="col-actions">
                <a
                  href="#"
                  @click.prevent="
                    ;(formData = item), ($refs.new.active = 1)
                  "
                >
                  <i class="fas fa-edit"></i>
                </a>

                <a
                  href="#"
                  @click.prevent=";(formData = item), del(item)"
                  class="icon-delete"
                >
                  <i class="fas fa-trash-alt"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-if="!loader && (!data.items || data.items.length === 0)">
        No items found
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@import './Users.module.sass'
</style>
