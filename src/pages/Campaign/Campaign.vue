<script>
import Chart from 'chart.js/auto'
import { createApiClient } from '../../services/api.js'
import Header from '../../components/Header/Header.vue'
import Popup from '../../components/Popup/Popup.vue'
import Toogle from '../../components/Toogle/Toogle.vue'
import ImageUpload from '../../components/ImageUpload/ImageUpload.vue'
import loaderGif from '../../images/loader.gif'

export default {
  name: 'Campaign',
  components: {
    Header,
    Popup,
    Toogle,
    Image: ImageUpload
  },
  inject: ['appUrl', 'appUser', 'appLogout'],
  data () {
    return {
      formData: {},
      loaderGif,
      data: { items: [], info: {} },
      details: [],
      date: '',
      date2: '',
      q: '',
      sort: '',
      loader: 1,
      iChart: -1,
      id: 0,
      type: 0,
      all: true,
      chartInstance: null
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
  beforeUnmount () {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }
  },
  methods: {
    get () {
      this.loader = 1

      const routeId = this.$route.params.id

      if (!this.appUrl) {
        this.loader = 0
        return
      }

      this.api.getBanners(this.formData, {
        date: this.date,
        date2: this.date2,
        id: routeId
      })
        .then((response) => {
          this.loader = 0
          this.data = response.data
          if (this.data.info && this.data.info.title) {
            document.title = this.data.info.title
          }
          if (this.iChart !== -1 && this.data.items[this.iChart]) {
            this.line(this.data.items[this.iChart])
          }
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

    getDetails (bid = false, type = false) {
      this.details = []
      if (bid) this.id = bid
      if (type) this.type = type
      if (this.id) bid = this.id
      if (this.type) type = this.type

      this.loader = 1

      this.api.getStatisticsDetails(this.formData, {
        date: this.date,
        date2: this.date2,
        q: this.q,
        sort: this.sort,
        bid: bid || '',
        type: type || ''
      })
        .then((response) => {
          this.details = response.data
          this.loader = 0
        })
        .catch((error) => {
          if (error.isApiError) {
            console.error(error.message)
          } else {
            this.appLogout()
          }
          this.loader = 0
        })
    },

    action () {
      if (!this.formData) return

      this.api.actionCampaign(this.formData)
        .then((response) => {
          if (this.$refs.new) this.$refs.new.active = 0

          if (this.formData.id) {
            this.$refs.header.$refs.msg.successFun(
              'Successfully updated campaign!'
            )
          } else {
            this.$refs.header.$refs.msg.successFun(
              'Successfully added new campaign!'
            )
          }
          this.get()
        })
        .catch((error) => {
          if (error.isApiError) {
            this.$refs.header.$refs.msg.alertFun(error.message)
          } else {
            console.log('errors: ', error)
          }
        })
    },

    actionAd () {
      if (!this.formData) return

      this.formData.copy = ''
      const routeId = this.$route.params.id

      this.api.actionBanner(this.formData, routeId)
        .then((response) => {
          if (this.$refs.ad) this.$refs.ad.active = 0

          if (this.formData.id) {
            this.$refs.header.$refs.msg.successFun(
              'Successfully updated banner!'
            )
          } else {
            this.$refs.header.$refs.msg.successFun(
              'Successfully added new banner!'
            )
          }
          this.get()
        })
        .catch((error) => {
          if (error.isApiError) {
            this.$refs.header.$refs.msg.alertFun(error.message)
          } else {
            console.log('errors: ', error)
          }
        })
    },

    async delAd () {
      if (
        await this.$refs.header.$refs.msg.confirmFun(
          'Please confirm next action',
          'Do you want to delete this banner?'
        )
      ) {
        this.api.deleteBanner(this.formData)
          .then((response) => {
            this.$refs.header.$refs.msg.successFun(
              'Successfully deleted banner!'
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
    },

    line (item) {
      this.$nextTick(() => {
        if (!this.$refs.chartOuter) return

        const dates = []
        const clicks = []
        const views = []

        if (item && item.line) {
          for (const i in item.line) {
            dates.push(i)
            clicks.push(item.line[i].clicks || 0)
            views.push(item.line[i].views || 0)
          }
        }

        const ctx = this.$refs.myChart
        if (!ctx) return

        if (this.chartInstance) this.chartInstance.destroy()

        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                backgroundColor: '#005990',
                borderColor: '#00599D',
                data: clicks,
                tension: 0.1
              },
              {
                label: 'Views',
                backgroundColor: '#5000B8',
                borderColor: '#5000B8',
                data: views,
                yAxisID: 'y2',
                tension: 0.1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { position: 'left', beginAtZero: true },
              y2: {
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false }
              },
              x: { ticks: { maxRotation: 45, minRotation: 45 } }
            }
          }
        })
      })
    },

    checkAll (prop) {
      if (!this.data.items[this.iChart]) return

      const sites = this.data.items[this.iChart].sites
      if (sites) {
        Object.values(sites).forEach(site => {
          site.include = prop
        })
      }
      this.formData = this.data.items[this.iChart]
      this.get()
    }
  }
}
</script>

<template>
  <div class="page-wrapper">
    <Header ref="header" />

    <div id="spinner" v-if="loader">
      <img :src="loaderGif" alt="Loading..." />
    </div>

    <div class="sub-header">
      <div class="content-container flex-between">
        <a
          class="btn-edit"
          href="#"
          @click.prevent="
            ;(formData = data.info), ($refs.new.active = 1)
          "
        >
          Edit campaign <i class="fas fa-edit"></i>
        </a>
        <h1 class="campaign-title" v-if="data && data.info">
          {{ data.info.title }}
        </h1>
      </div>
    </div>

    <div class="content-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <a
            class="btn-new"
            href="#"
            @click.prevent=";(formData = {}), ($refs.ad.active = 1)"
          >
            New <i class="fas fa-plus"></i>
          </a>
        </div>

        <div class="toolbar-center">
          <div class="date-group">
            <input type="date" v-model="date" @change="get()" />
            <span class="sep">-</span>
            <input type="date" v-model="date2" @change="get()" />
          </div>
        </div>

        <div class="toolbar-right">
          <span class="section-label">Ads</span>
        </div>
      </div>

      <div class="table-card" v-if="data.items && data.items.length > 0">
        <table class="styled-table">
          <thead>
            <tr>
              <th class="th-actions">Actions</th>
              <th>Fraud clicks</th>
              <th>Leads</th>
              <th>Clicks</th>
              <th>Views</th>
              <th class="th-link">Link</th>
              <th>Size</th>
              <th>Img</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in data.items" :key="item.id || i">
              <td class="td-actions">
                <a
                  href="#"
                  class="action-icon del"
                  @click.prevent=";(formData = item), delAd()"
                >
                  <i class="fas fa-trash-alt"></i>
                </a>
                <a
                  href="#"
                  class="action-icon chart"
                  @click.prevent="
                    formData = item
                    iChart = i
                    ;($refs.chart.active = 1), line(item)
                  "
                >
                  <i class="fas fa-chart-bar"></i>
                </a>
                <a
                  href="#"
                  class="action-icon edit"
                  @click.prevent="
                    ;(formData = item), ($refs.ad.active = 1)
                  "
                >
                  <i class="fas fa-edit"></i>
                </a>
              </td>

              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 4)
                  "
                >
                  {{ item.fclicks || 0 }}
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 3)
                  "
                >
                  {{ item.leads || 0 }}
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 2)
                  "
                >
                  <template v-if="item.clicks">{{ item.clicks }}</template>
                  <template v-else>0</template>
                </a>
              </td>
              <td>
                <a
                  href="#"
                  @click.prevent="
                    ;($refs.details.active = 1), getDetails(item.id, 1)
                  "
                >
                  {{ item.views }}
                </a>
              </td>

              <td class="td-link">
                <a :href="item.link" target="_blank" class="link-text">
                  {{ item.link }}
                </a>
              </td>

              <td>{{ item.size }}</td>

              <td class="td-toggle">
                <div class="toggle-wrapper">
                  <div
                    class="mini-preview"
                    v-if="item.img"
                    @click.prevent="
                      ;(formData = item), ($refs.ad.active = 1)
                    "
                  >
                    <img :src="appUrl + '/' + item.img" />
                  </div>
                  <Toogle
                    :modelValue="item.published"
                    @update:modelValue="
                      item.published = $event
                      ;(formData = item), actionAd()
                    "
                  />
                  <span class="row-id">{{ item.id }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else-if="!loader">No items found</div>
    </div>

    <Popup ref="chart" fullscreen="true" title="Chart">
      <div class="flex panel">
        <div class="w30 ptb25">
          <input
            class="legacy-input"
            type="date"
            v-model="date"
            @change="get()"
          />
          <input
            class="legacy-input"
            type="date"
            v-model="date2"
            @change="get()"
          />
        </div>
        <div class="w70 al">
          <div class="flex cubes">
            <div class="w30 clicks">
              <div>Clicks</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].clicks : 0
              }}
            </div>
            <div class="w30 views">
              <div>Views</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].views : 0
              }}
            </div>
            <div class="w30 leads">
              <div>Leads</div>
              {{
                data.items && data.items[iChart] ? data.items[iChart].leads : 0
              }}
            </div>
            <div class="w30 ctr">
              <div>CTR</div>
              {{
                data.items && data.items[iChart] && data.items[iChart].views > 0
                  ? (
                      (data.items[iChart].clicks * 100) /
                      data.items[iChart].views
                    ).toFixed(2)
                  : '0.00'
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex body">
        <div class="w30 ar filchart">
          <div class="itemchart ptble">
            <Toogle
              :modelValue="all"
              @update:modelValue=";(all = $event), checkAll($event)"
            />
            ALL
            <hr />
            <div
              class="itemchart ptble"
              v-if="
                data.items && data.items[iChart] && data.items[iChart].sites
              "
              v-for="(s, index) in data.items[iChart].sites"
              :key="index"
            >
              <Toogle
                :modelValue="s.include"
                @update:modelValue="
                  ;(s.include = $event), (formData = data.items[iChart])
                  get()
                "
              />
              {{ s.site }}
            </div>
          </div>
        </div>
        <div class="w70" ref="chartOuter">
          <div ref="chartHints">
            <div class="chartHintsViews">Views</div>
            <div class="chartHintsClicks">Clicks</div>
          </div>
          <canvas ref="myChart"></canvas>
          <hr />
        </div>
      </div>
    </Popup>

    <Popup
      ref="new"
      :title="
        formData && formData.id ? 'Edit campaign' : 'New campaign'
      "
    >
      <div class="form inner-form">
        <form @submit.prevent="action()" v-if="formData">
          <div class="row">
            <label>Name</label>
            <input type="text" v-model="formData.title" required />
          </div>
          <div class="row">
            <button class="btnS" v-if="formData && formData.id">
              Edit
            </button>
            <button class="btnS" v-if="formData && !formData.id">
              Add
            </button>
          </div>
        </form>
      </div>
    </Popup>

    <Popup
      ref="ad"
      :title="
        formData && formData.id ? 'Edit banner' : 'New banner'
      "
    >
      <div class="form inner-form">
        <form @submit.prevent="actionAd()" v-if="formData">
          <div class="row">
            <label>Link</label>
            <input type="text" v-model="formData.link" required />
          </div>
          <div class="row">
            <label>Description</label>
            <input type="text" v-model="formData.description" />
          </div>
          <div class="row">
            <label>Type</label>
            <select v-model="formData.type" required>
              <option value="0"></option>
              <option
                v-if="data.types"
                v-for="c in data.types"
                :value="c.id"
                :key="c.id"
              >
                {{ c.title }}
              </option>
            </select>
          </div>
          <div class="row">
            <label>Image</label>
            <Image
              v-model="formData.img"
              @update:modelValue="formData.img = $event"
            />
          </div>
          <div class="row">
            <button class="btnS" v-if="formData && formData.id">
              Edit
            </button>
            <button class="btnS" v-if="formData && !formData.id">
              Add
            </button>
          </div>
        </form>
      </div>
    </Popup>

    <Popup ref="details" fullscreen="true" title="Details">
      <div class="flex panel">
        <div class="w60">
          <input
            type="text"
            placeholder="Search..."
            v-model="q"
            @keyup="getDetails()"
          />
          <input
            class="legacy-input"
            type="date"
            v-model="date"
            @change="getDetails()"
          />
        </div>
        <div class="w40 al"></div>
      </div>
      <br />
      <div class="table">
        <table v-if="details && details.length > 0">
          <thead>
            <tr>
              <th class="id">#</th>
              <th>Type</th>
              <th>IP <i class="fas fa-caret-down"></i></th>
              <th class="id">Date</th>
              <th class="id">Site</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in details" :key="item.id || i">
              <td class="id">{{ item.id }}</td>
              <td>
                <template v-if="item.type === 1">Views</template>
                <template v-if="item.type === 2">Clicks</template>
                <template v-if="item.type === 3">Leads</template>
              </td>
              <td>{{ item.ip }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.site }}</td>
            </tr>
          </tbody>
        </table>
        <div class="empty" v-else>No items</div>
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="sass" >
@import './styles.module.sass'
</style>
