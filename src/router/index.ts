import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import RoleSelectionPage from '../views/RoleSelectionPage.vue'
import FinancierTabsPage from '../views/financier/FinancierTabsPage.vue'
import BorrowerTabsPage from '../views/borrower/BorrowerTabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: RoleSelectionPage
  },
  {
    path: '/financier/',
    component: FinancierTabsPage,
    children: [
      {
        path: '',
        redirect: '/financier/borrowers'
      },
      {
        path: 'borrowers',
        component: () => import('@/views/financier/BorrowersPage.vue')
      },
      {
        path: 'contracts',
        component: () => import('@/views/financier/ContractsPage.vue')
      },
      {
        path: 'payments',
        component: () => import('@/views/financier/PaymentsPage.vue')
      },
      {
        path: 'offers',
        component: () => import('@/views/financier/OffersPage.vue')
      }
    ]
  },
  {
    path: '/borrower/',
    component: BorrowerTabsPage,
    children: [
      {
        path: '',
        redirect: '/borrower/contracts'
      },
      {
        path: 'contracts',
        component: () => import('@/views/borrower/BorrowerContractsPage.vue')
      },
      {
        path: 'payments',
        component: () => import('@/views/borrower/BorrowerPaymentsPage.vue')
      },
      {
        path: 'offers',
        component: () => import('@/views/borrower/BorrowerOffersPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
