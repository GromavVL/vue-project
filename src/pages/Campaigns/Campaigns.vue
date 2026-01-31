<script>
import Chart from 'chart.js/auto'
import { createApiClient } from '../../services/api.js'

import Header from '../../components/Header/Header.vue'
import Popup from '../../components/Popup/Popup.vue'
import Toogle from '../../components/Toogle/Toogle.vue'
import loaderGif from '../../images/loader.gif'

export default {
  name: 'Campaigns',
  components: { Header, Popup, Toogle },
  inject: ['appUrl', 'appUser', 'appLogout'],
  data () {
    return {
      formData: {},
      loaderGif,
      data: { items: [] },
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

      if (!this.appUrl) {
        console.log('URL API not found')
        this.loader = 0
        return
      }

      this.api.getCampaigns({
        date: this.date,
        date2: this.date2,
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

    getChart () {
      if (
        this.iChart === -1 ||
        !this.data.items ||
        !this.data.items[this.iChart]
      ) return

      const item = this.data.items[this.iChart]
      this.formData = item

      this.api.getCampaignBannersChart(this.formData, {
        date: this.date,
        date2: this.date2
      })
        .then((response) => {
          const resItem = response.data.items
            ? response.data.items
            : response.data

          if (resItem) {
            if (resItem.line) this.data.items[this.iChart].line = resItem.line
            if (resItem.sites) this.data.items[this.iChart].sites = resItem.sites
            if (resItem.clicks !== undefined) this.data.items[this.iChart].clicks = resItem.clicks
            if (resItem.views !== undefined) this.data.items[this.iChart].views = resItem.views
            if (resItem.leads !== undefined) this.data.items[this.iChart].leads = resItem.leads
          }

          this.renderChart(this.data.items[this.iChart])
        })
        .catch((error) => {
          console.log('Chart error', error)
        })
    },

    line (item) {
      this.$nextTick(() => {
        if (this.$refs.chartOuter) {
          this.getChart()
        } else {
          console.error('Element chartOuter not found')
        }
      })
    },

    renderChart (item) {
      if (this.chartInstance) {
        this.chartInstance.destroy()
      }

      this.$nextTick(() => {
        if (!this.$refs.chartOuter) return

        const dates = []
        const clicks = []
        const views = []

        const current = new Date(this.date)
        const end = new Date(this.date2)

        if (!isNaN(current) && !isNaN(end)) {
          while (current <= end) {
            const year = current.getFullYear()
            const month = ('0' + (current.getMonth() + 1)).slice(-2)
            const day = ('0' + current.getDate()).slice(-2)

            const keyDateDot = `${day}.${month}.${year}`
            const keyDateDash = `${year}-${month}-${day}`

            dates.push(`${day}.${month}.${year}`)

            let stats = null
            if (item && item.line) {
              stats = item.line[keyDateDot] || item.line[keyDateDash]
            }

            if (stats) {
              clicks.push(parseInt(stats.clicks) || 0)
              views.push(parseInt(stats.views) || 0)
            } else {
              clicks.push(0)
              views.push(0)
            }
            current.setDate(current.getDate() + 1)
          }
        }

        const ctx = this.$refs.myChart
        if (!ctx) return

        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [
              {
                label: 'Clicks',
                backgroundColor: 'rgba(9, 132, 227, 0.1)',
                borderColor: '#0984e3',
                data: clicks,
                yAxisID: 'y',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#0984e3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: 'Views',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                borderColor: '#6c5ce7',
                data: views,
                yAxisID: 'y2',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#6c5ce7',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#2d3436',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#b2bec3',
                  font: { size: 11 }
                }
              },
              y: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.04)',
                  drawBorder: false
                },
                ticks: {
                  color: '#b2bec3',
                  font: { size: 11 }
                }
              },
              y2: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false,
                  drawBorder: false
                },
                ticks: {
                  color: '#b2bec3',
                  font: { size: 11 }
                }
              }
            }
          }
        })
      })
    },

    checkAll (prop) {
      if (this.iChart === -1 || !this.data.items[this.iChart]) return

      const currentItem = this.data.items[this.iChart]
      if (currentItem && currentItem.sites) {
        Object.values(currentItem.sites).forEach(site => {
          site.include = prop
        })
      }
      this.formData = currentItem
      this.getChart()
    },

    action () {
      if (!this.formData) return
      this.formData.copy = ''

      this.api.actionCampaign(this.formData)
        .then((response) => {
          if (this.$refs.new) this.$refs.new.active = 0

          if (this.$refs.header && this.$refs.header.$refs.msg) {
            if (this.formData.id) {
              this.$refs.header.$refs.msg.successFun(
                'Successfully updated campaign!'
              )
            } else {
              this.$refs.header.$refs.msg.successFun(
                'Successfully added new campaign!'
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
            'Do you want to delete this campaign?'
          )
        ) {
          this.api.deleteCampaign(this.formData)
            .then((response) => {
              this.$refs.header.$refs.msg.successFun(
                'Successfully deleted campaign!'
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
    },

    openDetails (id, type) {
      this.$refs.details.active = 1
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
            type="date"
            v-model="date"
            @change="get()"
            class="date-input"
          />
          <span class="date-separator">&mdash;</span>
          <input
            type="date"
            v-model="date2"
            @change="get()"
            class="date-input"
          />
        </div>

        <div class="toolbar-right">
          <h1 class="page-title">Campaigns</h1>
        </div>
      </div>

      <Popup ref="chart" fullscreen="true" title="Chart">
        <div
          class="flex panel"
          style="display: flex; justify-content: space-between; padding: 20px"
        >
          <div class="w30 ptb25">
            <input
              type="date"
              v-model="date"
              @change="getChart()"
              class="date-input"
            />
            <input
              type="date"
              v-model="date2"
              @change="getChart()"
              class="date-input"
            />
          </div>

          <div class="w70-al" style="flex-grow: 1; padding-left: 20px">
            <div
              class="flex cubes"
              style="display: flex; gap: 20px; text-align: center"
            >
              <div class="w30 clicks">
                <div style="font-weight: bold; color: #fff">Clicks</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].clicks
                    : 0
                }}
              </div>
              <div class="w38 views">
                <div style="font-weight: bold; color: #fff">Views</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].views
                    : 0
                }}
              </div>
              <div class="w30 leads">
                <div>Leads</div>
                {{
                  data.items && data.items[iChart]
                    ? data.items[iChart].leads
                    : 0
                }}
              </div>
              <div class="w38-ctr">
                <div>CTR</div>
                {{
                  data.items &&
                  data.items[iChart] &&
                  data.items[iChart].views > 0
                    ? (
                        (data.items[iChart].clicks * 100) /
                        data.items[iChart].views
                      ).toFixed(2)
                    : '0.00'
                }}%
              </div>
            </div>
          </div>
        </div>

        <div class="flex body" style="display: flex; margin-top: 20px">
          <div
            class="w30 ar filchart"
            style="
              width: 30%;
              border-right: 1px solid #eee;
              padding-right: 10px;
            "
          >
            <div
              class="itemchart ptb10"
              style="padding: 5px 0"
              v-if="
                data.items && data.items[iChart] && data.items[iChart].sites
              "
            >
              <Toogle
                v-model="all"
                @update:modelValue="
                  val => {
                    all = val
                    checkAll(val)
                  }
                "
              />
              <strong>ALL</strong>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0" />

            <div
              class="itemchart ptb10"
              style="
                padding: 5px 0;
                display: flex;
                align-items: center;
                gap: 10px;
              "
              v-if="data.items && data.items[iChart]"
              v-for="(s, index) in data.items[iChart].sites"
              :key="s.site || index"
            >
              <Toogle
                v-model="s.include"
                @update:modelValue="
                  ;(formData = data.items[iChart]), getChart()
                "
              />
              <span style="font-size: 13px">{{ s.site }}</span>
            </div>
          </div>

          <div
            class="w70"
            ref="chartOuter"
            style="width: 70%; padding-left: 20px"
          >
            <div
              ref="chartHints"
              style="
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 10px;
              "
            >
              <div
                class="chartHintsViews"
                style="color: #6c5ce7; font-weight: bold"
              >
                Views
              </div>
              <div
                class="chartHintsClicks"
                style="color: #0984e3; font-weight: bold"
              >
                Clicks
              </div>
            </div>
            <div style="height: 300px; position: relative">
              <canvas ref="myChart"></canvas>
            </div>
          </div>
        </div>
      </Popup>

      <Popup
        ref="new"
        :title="
          formData && formData.id
            ? 'Edit campaign'
            : 'New campaign'
        "
      >
        <div class="form-container">
          <form @submit.prevent="action()" v-if="formData">
            <div class="form-group">
              <label>Name</label>
              <input
                type="text"
                v-model="formData.title"
                required
                placeholder="Enter campaign name..."
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
                Add Campaign
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
              <th>Title</th>
              <th class="col-stat">Views</th>
              <th class="col-stat">Clicks</th>
              <th class="col-stat">Leads</th>
              <th class="col-stat">Fraud</th>
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
              <td class="col-title">
                <router-link :to="'/campaign/' + item.id" class="link-primary">
                  {{ item.title }}
                </router-link>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 1)">
                  {{ item.views }}
                </a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 2)">
                  {{ item.clicks || 0 }}
                </a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 3)">
                  {{ item.leads || 0 }}
                </a>
              </td>
              <td class="col-stat">
                <a href="#" @click.prevent="openDetails(item.id, 4)">
                  {{ item.fclicks || 0 }}
                </a>
              </td>
              <td class="col-actions">
                <router-link
                  :to="'/campaign/' + item.id"
                  style="margin-right: 8px; color: #888"
                >
                  <i class="fas fa-edit"></i>
                </router-link>

                <a
                  href="#"
                  @click.prevent="
                    ;(formData = item), (iChart = i)
                    $refs.chart.active = 1
                    line(item)
                  "
                  style="margin-right: 8px; color: #888"
                >
                  <i class="fas fa-chart-bar"></i>
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

      <div class="empty-state" v-if="!data.items || data.items.length === 0">
        No items found
      </div>
    </div>

    <Popup ref="details" title="Campaign Details">
      <div class="popup-content">
        <p>Details for campaign loaded in console.</p>
      </div>
    </Popup>
  </div>
</template>

<style scoped lang="sass">
@import './Campaigns.module.sass'
</style>
