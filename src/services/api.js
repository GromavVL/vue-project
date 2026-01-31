import axios from 'axios'
import { toFormData } from '../utils/formData.js'

export function createApiClient (baseUrl, auth) {
  function post (endpoint, data) {
    const url = `${baseUrl}${endpoint}${auth ? '?auth=' + auth : ''}`
    return axios.post(url, data).then((response) => {
      if (response.data.error) {
        return Promise.reject({ isApiError: true, message: response.data.error })
      }
      return response
    })
  }

  return {
    login (formObj) {
      const data = toFormData(formObj)
      return axios.post(`${baseUrl}/site/login`, data)
    },

    getCampaigns (filters = {}) {
      const data = new FormData()
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getCampaigns', data)
    },

    getCampaignBannersChart (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      return post('/site/getCampaignBannersChart', data)
    },

    actionCampaign (formObj) {
      const data = toFormData(formObj)
      return post('/site/actionCampaign', data)
    },

    deleteCampaign (formObj) {
      const data = toFormData(formObj)
      return post('/site/deleteCampaign', data)
    },

    getBanners (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.id) data.append('id', filters.id)
      return post('/site/getBanners', data)
    },

    actionBanner (formObj, campaignId) {
      const data = toFormData(formObj)
      if (campaignId) data.append('campaign', campaignId)
      return post('/site/actionBanner', data)
    },

    deleteBanner (formObj) {
      const data = toFormData(formObj)
      return post('/site/deleteBanner', data)
    },

    getStatisticsDetails (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      if (filters.bid) data.append('bid', filters.bid)
      if (filters.type) data.append('type', filters.type)
      return post('/site/getStatisticsDetails', data)
    },

    getUsers (filters = {}) {
      const data = new FormData()
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getUsers', data)
    },

    getUser (filters = {}) {
      const data = new FormData()
      if (filters.id) data.append('id', filters.id)
      if (filters.tab) data.append('tab', filters.tab)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getUser', data)
    },

    actionUser (formObj) {
      const data = toFormData(formObj)
      return post('/site/actionUser', data)
    },

    deleteUser (formObj) {
      const data = toFormData(formObj)
      return post('/site/deleteUser', data)
    },

    getUserPayments (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getUserPayments', data)
    },

    getUserSites (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getUserSites', data)
    },

    getUserStatistic (formObj, filters = {}) {
      const data = toFormData(formObj)
      if (filters.date) data.append('date', filters.date)
      if (filters.date2) data.append('date2', filters.date2)
      if (filters.q) data.append('q', filters.q)
      if (filters.sort) data.append('sort', filters.sort)
      return post('/site/getUserStatistic', data)
    },

    actionPayment (formObj) {
      const data = toFormData(formObj)
      return post('/site/actionPayment', data)
    },

    deletePayment (formObj) {
      const data = toFormData(formObj)
      return post('/site/deletePayment', data)
    }
  }
}
