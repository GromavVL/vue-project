<script>
export default {
  name: 'Toogle',
  props: {
    modelValue: [String, Number, Boolean]
  },
  data () {
    return {
      value: false
    }
  },
  watch: {
    modelValue (val) {
      this.value = val === '1' || val === 1 || val === 'true' || val === true
    }
  },
  mounted () {
    this.value =
      this.modelValue === '1' ||
      this.modelValue === 1 ||
      this.modelValue === 'true' ||
      this.modelValue === true
  },
  methods: {
    change () {
      const payload = this.value ? '1' : '0'
      this.$emit('update:modelValue', payload)
    }
  }
}
</script>

<template>
  <label class="switch-creative">
    <input type="checkbox" v-model="value" @change="change()" />

    <div class="switch-bg">
      <div class="icons-track">
        <i class="fas fa-check icon-check"></i>
        <i class="fas fa-times icon-cross"></i>
      </div>

      <div class="switch-handle"></div>
    </div>
  </label>
</template>

<style scoped lang="sass">
@import './Togle.module.sass'
</style>
