import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import * as middleware from 'i18next-http-middleware'
import path from 'node:path'

const __dirname = import.meta.dirname;

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '/../locales/{{lng}}/translation.json')
    }
  })

export default middleware.handle(i18next)
