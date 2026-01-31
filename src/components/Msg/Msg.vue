<script>
import Popup from '../Popup/Popup.vue'

export default {
  name: 'Msg',
  components: { Popup },
  data () {
    return {
      alert: '',
      success: '',
      t1: null,
      t2: null,
      confirmTitle: 'Please confirm next action',
      confirm: '',
      code: 0,
      interval: null
    }
  },
  methods: {
    fadeIn (el, timeout, display) {
      el.style.opacity = 0
      el.style.display = display || 'block'
      el.style.transition = `opacity ${timeout}ms`
      setTimeout(() => {
        el.style.opacity = 1
      }, 10)
    },
    fadeOut (el, timeout) {
      el.style.opacity = 1
      el.style.transition = `opacity ${timeout}ms`
      el.style.opacity = 0
      setTimeout(() => {
        el.style.display = 'none'
      }, timeout)
    },
    successFun (msg) {
      this.success = msg

      if (this.t1) clearTimeout(this.t1)
      if (this.t2) clearTimeout(this.t2)

      this.t1 = setTimeout(() => {
        const block = this.$refs.successBlock
        if (block) {
          this.fadeIn(block, 1000, 'flex')
          this.t2 = setTimeout(() => {
            this.fadeOut(block, 1000)
            setTimeout(() => {
              this.success = ''
            }, 1000)
          }, 3000)
        }
      }, 100)
    },
    alertFun (msg) {
      this.alert = msg

      if (this.t1) clearTimeout(this.t1)
      if (this.t2) clearTimeout(this.t2)

      this.t1 = setTimeout(() => {
        const block = this.$refs.alertBlock
        if (block) {
          this.fadeIn(block, 1000, 'flex')
          this.t2 = setTimeout(() => {
            this.fadeOut(block, 1000)
            setTimeout(() => {
              this.alert = ''
            }, 1000)
          }, 3000)
        }
      }, 100)
    },
    confirmFun (title, text) {
      this.code = 0
      return new Promise((resolve) => {
        this.confirmTitle = title
        this.confirm = text
        this.$refs.confirm.active = 1
        this.interval = setInterval(() => {
          if (this.code > 0) {
            resolve()
          } else if (this.$refs.confirm && this.$refs.confirm.active === 0) {
            this.code = 2
            resolve()
          }
        }, 100)
      }).then(() => {
        clearInterval(this.interval)
        this.$refs.confirm.active = 0
        if (this.code === 1) {
          return true
        }
        return false
      })
    }
  }
}
</script>

<template>
  <div>
    <div class="alertMsg" ref="alertBlock" v-if="alert" style="display: none">
      <div class="wrapper al">
        <i class="fas fa-times-circle"></i> {{ alert }}
      </div>
    </div>

    <div class="successMsg" ref="successBlock" v-if="success" style="display: none">
      <div class="wrapper al">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
    </div>

    <Popup ref="confirm" title="">
      <div class="ac ptb20">
        <div class="confirm-text">
          <i class="fas fa-info-circle"></i> {{ confirm }}
        </div>

        <div class="botBtns">
          <a class="btnS btn-no" href="#" @click.prevent="code = 2">No</a>
          <a class="btnS btn-yes" href="#" @click.prevent="code = 1">Yes</a>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="sass">
@import './Msg.module.sass'
</style>
