import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import MainLayout from '../components/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Settings from '../views/Settings.vue'
import Receive from '../views/docs/Receive.vue'
import Assign from '../views/docs/Assign.vue'
import MyDocs from '../views/docs/MyDocs.vue'
import Search from '../views/Search.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/', 
    component: MainLayout, 
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'users', name: 'Users', component: Users },
      { path: 'settings', name: 'Settings', component: Settings },
      { path: 'receive', name: 'Receive', component: Receive },
      { path: 'assign', name: 'Assign', component: Assign },
      { path: 'mydocs', name: 'MyDocs', component: MyDocs },
      { path: 'search', name: 'Search', component: Search }
    ]
  },
  { path: '/:catchAll(.*)', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
