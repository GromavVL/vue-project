<template>
  <div class="image-upload-container">
    <div class="image-preview-area">
      <a href="#" class="select_img" @click.prevent="triggerInput">
        <span v-if="preview">
          <img :src="preview" class="im" alt="Preview" />
        </span>
        <span v-else>
          <img :src="placeholderSvg" alt="Upload placeholder" />
        </span>
      </a>
    </div>

    <input
      type="file"
      style="display: none"
      ref="input"
      accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
      @change="change($event)"
    />
  </div>
</template>

<script>
import placeholderSvg from '../../images/placeholder.svg'

export default {
  name: 'ImageUpload',
  props: {
    modelValue: [String, File]
  },
  emits: ['update:modelValue'],
  inject: ['appUrl'],
  data () {
    return {
      placeholderSvg,
      preview: ''
    }
  },
  mounted () {
    this.setPreview(this.modelValue)
  },
  watch: {
    modelValue (newVal) {
      this.setPreview(newVal)
    }
  },
  methods: {
    triggerInput () {
      this.$refs.input.click()
    },
    setPreview (val) {
      if (!val) {
        this.preview = ''
        return
      }

      if (val instanceof File) {
        const reader = new FileReader()
        reader.onload = e => {
          this.preview = e.target.result
        }
        reader.readAsDataURL(val)
      } else if (typeof val === 'string') {
        if (val.startsWith('data:')) {
          this.preview = val
        } else if (val.startsWith('http')) {
          this.preview = val
        } else {
          this.preview = this.appUrl ? this.appUrl + '/' + val : val
        }
      }
    },
    change (event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = e => {
          this.preview = e.target.result
        }
        reader.readAsDataURL(file)

        this.$emit('update:modelValue', file)
      }
    }
  }
}
</script>

<style scoped lang="sass">
@import './ImageUpload.module.sass'
</style>
