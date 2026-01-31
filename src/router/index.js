import { createRouter, createWebHashHistory } from 'vue-router'

const Login = () => import('../pages/login/Login.vue')
const Campaigns = () => import('../pages/Campaigns/Campaigns.vue')
const Campaign = () => import('../pages/Campaign/Campaign.vue')
const Users = () => import('../pages/Users/Users.vue')
const User = () => import('../pages/User/User.vue')

const routes = [
  {
    path: '/',
    name: 'Sign in',
    component: Login
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: Campaigns
  },
  {
    path: '/campaign/:id',
    name: 'Campaign',
    component: Campaign
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
