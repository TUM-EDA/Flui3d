import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import languages from './lang'


const app = createApp(App)
app.use(createPinia())

const i18n = createI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: languages
})

app.use(i18n)
app.mount('#app')

