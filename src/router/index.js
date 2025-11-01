import { createRouter, createWebHistory } from 'vue-router'
import { getAnalytics, logEvent } from "firebase/analytics"

// Layout components
import LayoutSrc from '../components/Layout/LayoutSrc.vue'
import TVChartContainer from '../components/TVChartContainerMOB.vue'
import MultiChart from '../components/MultiChart.vue'
import LightweightChart from '../components/LightweightChart.vue'

// Dashboard components
import DbLayout from '../views/Dashboard/DbLayout.vue'
import DashBoard from '../views/Dashboard/DashBoard.vue'

// Position and Holdings
import PosiTions from '../views/Positions/PosiTions.vue'
import HolDings from '../views/Holdings/HolDings.vue'
import PortfiloAn from '../views/Holdings/PortfiloAn.vue'

// Orders
import OrderScreen from '../views/Orders/OrderScreen.vue'
import StockOrderSrc from '../views/Orders/StockOrderSrc.vue'
import StocksOrderBook from '../views/Orders/StocksOrderBook.vue'
import StocksTradeBook from '../views/Orders/StocksTradeBook.vue'
import StockGTTorders from '../views/Orders/StockGTTorders.vue'
import StockSIPorders from '../views/Orders/StockSIPorders.vue'
import StockBSKorders from '../views/Orders/StockBSKorders.vue'

// Accounts
import FundSrc from '../views/Accounts/FundSrc.vue'
import SettingSrc from '../views/Accounts/SettingSrc.vue'
import AlertScreen from '../views/Accounts/AlertScreen.vue'

// Stocks pages
import StocksSrc from '../views/Dashboard/stocks/StocksSrc.vue'
import StocksDetails from '../views/Dashboard/stocks/StocksDetails.vue'
import StocksIndices from '../views/Dashboard/stocks/StocksIndices.vue'
import StockMarket from '../views/Dashboard/stocks/StockMarket.vue'
import StockScreener from '../views/Dashboard/stocks/StockScreener.vue'
import StockAD from '../views/Dashboard/stocks/StockAD.vue'
import SingleStocks from '../views/Dashboard/stocks/SingleStocks.vue'

// Mutual fund pages
import MutualSrc from '../views/Dashboard/mutualfund/MutualSrc.vue'
import MutualOrderbook from '../views/Dashboard/mutualfund/MutualOrderbook.vue'
import MutualCategorieSrc from '../views/Dashboard/mutualfund/MutualCategorieSrc.vue'
import MuturalNfoSrc from '../views/Dashboard/mutualfund/MuturalNfoSrc.vue'
import MutualSingle from '../views/Dashboard/mutualfund/MutualSingle.vue'

// Bond pages
import BondSrc from '../views/Dashboard/bonds/BondSrc.vue'
import BondsOrderbook from '../views/Dashboard/bonds/BondsOrderbook.vue'

// IPO pages
import IpoSrc from '../views/Dashboard/ipos/IpoSrc.vue'
import IpoOrderbook from '../views/Dashboard/ipos/IpoOrderbook.vue'
import IpoPerformance from '../views/Dashboard/ipos/IpoPerformance.vue'

// FNO pages
import FnoSrc from '../views/Dashboard/fno/FnoSrc.vue'

// Collection pages
import CollectionSrc from '../views/Dashboard/collections/CollectionSrc.vue'
import MasterFile from '../views/Dashboard/NewsAI/MasterFile.vue'
import CollectionSingle from '../views/Dashboard/collections/CollectionSingle.vue'

// Other views
import ViewsLayout from '../views/ViewsLayout.vue'
import NotFoundPage from '../views/NotFoundPage.vue'
import StartCheck from '../views/StartCheck.vue'

// Initialize Firebase Analytics with error handling
let analytics = null
try {
  analytics = getAnalytics()
} catch (error) {
  console.error('Failed to initialize Firebase Analytics:', error)
}

const routes = [
  {
    path: '/sc',
    name: 'sc',
    component: StartCheck
  },
  {
    path: '/tv',
    name: 'tv',
    component: TVChartContainer
  },
  {
    path: '/mtv',
    name: 'mtv',
    component: MultiChart
  },
  {
    path: '/lwc',
    name: 'lwc',
    component: LightweightChart
  },
  {
    path: '/',
    redirect: '/stocks',
    name: 'layout',
    component: LayoutSrc,
    children: [
      {
        path: '/',
        redirect: '/stocks',
        name: 'dashboard',
        component: DashBoard,
        children: [
          {
            path: '/stocks',
            name: 'stocks',
            component: StocksSrc
          },
          {
            path: '/stocks/allindices',
            name: 'stocks indices',
            component: StocksIndices
          },
          {
            path: '/stocks/market',
            name: 'stocks market',
            component: StockMarket
          },
          {
            path: '/stocks/screener',
            name: 'stocks screener',
            component: StockScreener
          },
          {
            path: '/stocks/advance_decline',
            name: 'stocks advance decline',
            component: StockAD
          },
          {
            path: '/stocks/details',
            name: 'dashboard layout',
            component: DbLayout,
            children: [
              {
                path: '/stocks/details',
                name: 'stocks details',
                component: StocksDetails
              },
              {
                path: '/fno',
                name: 'fno',
                component: FnoSrc
              },
            ]
          },
          {
            path: '/mutualfund',
            name: 'mutual fund home',
            component: MutualSrc
          },
          {
            path: '/mutualfund/orderbook',
            name: 'mutual fund orderbook',
            component: MutualOrderbook
          },
          {
            path: '/mutualfund/categories',
            name: 'mutual fund categories',
            component: MutualCategorieSrc
          },
          {
            path: '/mutualfund/nfo',
            name: 'mutual fund nfo',
            component: MuturalNfoSrc
          },
          {
            path: '/mutualfund/single',
            alias: '/mutualfund/*',
            name: 'mutual fund single',
            component: MutualSingle
          },
          {
            path: '/bonds',
            name: 'bonds home',
            component: BondSrc
          },
          {
            path: '/bonds/orderbook',
            name: 'bonds orderbook',
            component: BondsOrderbook
          },
          {
            path: '/ipo',
            name: 'ipos home',
            component: IpoSrc
          },
          {
            path: '/ipo/orderbook',
            name: 'ipos orderbook',
            component: IpoOrderbook
          },
          {
            path: '/ipo/performance',
            name: 'ipos performance',
            component: IpoPerformance
          },
          {
            path: '/collection',
            name: 'collection home',
            component: CollectionSrc
          },
          {
            path: '/mst',
            name: 'mst home',
            component: MasterFile
          },
          {
            path: '/collection/single',
            alias: '/collection/*',
            name: 'collection single',
            component: CollectionSingle
          },
        ],
      },
      {
        path: '/funds',
        name: 'funds',
        component: FundSrc
      },
      {
        path: '/settings',
        name: 'Settings',
        component: SettingSrc
      },
      {
        path: '/orders',
        name: 'orderbook',
        component: StockOrderSrc,
      },
      {
        path: '/orders/book',
        name: 'orders book',
        component: StocksOrderBook,
      },
      {
        path: '/orders/trade',
        name: 'orders trade',
        component: StocksTradeBook,
      },
      {
        path: '/orders/gtt',
        name: 'orders gtt',
        component: StockGTTorders,
      },
      {
        path: '/orders/basket',
        name: 'orders basket',
        component: StockBSKorders,
      },
      {
        path: '/orders/sip',
        name: 'orders sip',
        component: StockSIPorders,
      },
      {
        path: '/positions',
        name: 'views layout',
        component: ViewsLayout,
        children: [
          {
            path: '/positions',
            name: 'positions',
            component: PosiTions,
          },
          {
            path: '/holdings',
            name: 'holdings',
            component: HolDings,
          },
          {
            path: '/notification',
            name: 'alert screen',
            component: AlertScreen,
          },
          {
            path: '/stocks/single',
            alias: '/stocks/*',
            name: 'single stocks',
            component: SingleStocks,
          },
          {
            path: '/portifilo',
            name: 'PortfiloAn',
            component: PortfiloAn,
          },
        ]
      },
      {
        path: '/:pathMatch(.*)*',
        component: NotFoundPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    window.scrollTo(0, 0)
  }
})

// Redirect certain pages to /stocks on hard refresh (initial load)
router.beforeEach((to, from) => {
  // If this is the very first navigation (page refresh or direct entry)
  const isInitialLoad = from.name === undefined

  if (isInitialLoad) {
    const shouldRedirectToStocks = (
      to.path === '/positions' ||
      to.path === '/holdings' ||
      to.path === '/funds' ||
      to.path === '/notification' ||
      to.path.startsWith('/orders')
    )

    if (shouldRedirectToStocks) {
      return { path: '/stocks', replace: true }
    }
  }
})

router.afterEach((to) => {
  try {
    if (analytics) {
      logEvent(analytics, "page_view", { page_path: to.fullPath })
    }
  } catch (error) {
    console.error('Firebase analytics error:', error)
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('Router navigation error:', error)
})

export default router