import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import * as middleware from 'i18next-http-middleware'

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: 'src/locales/{{lng}}/translation.json'
    }
  })

export default middleware.handle(i18next)
