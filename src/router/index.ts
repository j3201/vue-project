import { createRouter, createWebHistory } from 'vue-router'
import ImagePage from '../views/ImagePage.vue'
import PdfPage from '../views/PdfPage.vue'
import NavPage from '../views/NavPage.vue'
import RandomPage from '../views/RandomPage.vue'
import StayPage from '../views/StayPage.vue'

const routes = [
  { path: '/', redirect: '/image' },
  { path: '/image', component: ImagePage },
  { path: '/pdf', component: PdfPage },
  { path: '/nav', component: NavPage },
  { path: '/random', component: RandomPage },
  { path: '/stay', component: StayPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router