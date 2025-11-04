import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0037B7',
          secondary: '#0037B7',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          // Custom theme colors matching old app
          mainbg: '#fff',
          maintext: '#000',
          secbg: '#F1F3F8',
          subtext: '#666666',
          outline: '#EBEEF0',
          subline: '#454344',
          mainred: '#F23645',
          maingreen: '#43A833',
          secred: '#ffcdcd90',
          secgreen: '#ECF8F1',
          cardbg: '#ffffff',
          btnclr: '#000',
          btntext: '#fff',
          primhover: '#CFD9F2',
          statcard: '#FAFBFF',
          loaderbg: '#FAFBFF',
        },
      },
      dark: {
        colors: {
          primary: '#2E65F6',
          secondary: '#2E65F6',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          // Custom theme colors matching old app
          mainbg: '#000',
          maintext: '#fff',
          secbg: '#1E1E1E',
          subtext: '#999999',
          outline: '#222222',
          subline: '#EBEEF0',
          mainred: '#FF1717',
          maingreen: '#1BBC00',
          secred: '#FF17173a',
          secgreen: '#49c5333a',
          cardbg: '#121212',
          btnclr: '#B0BEC5',
          btntext: '#000',
          primhover: '#2E65F61a',
          statcard: '#1E1E1E',
          loaderbg: 'rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})