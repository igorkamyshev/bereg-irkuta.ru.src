const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const errorHandler = require('errorhandler')
const path = require('path')
const Prismic = require('prismic-javascript')
const PrismicDOM = require('prismic-dom')
const compression = require('compression')

const PrismicConfig = require('./prismic-configuration')
const { fetchAbout } = require('./content/fetchAbout')
const { fetchContacts } = require('./content/fetchContacts')

module.exports = (() => {
  const app = express()

  app.set('port', process.env.PORT || 3000)
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'pug')
  // app.use(favicon('public/images/punch.png'))
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(methodOverride())
  app.use(compression())
  app.use(express.static(path.join(__dirname, 'public')))

  app.use(errorHandler())

  app.use((req, res, next) => {
    res.locals.ctx = {
      endpoint: PrismicConfig.apiEndpoint,
      linkResolver: PrismicConfig.linkResolver,
    }
    // add PrismicDOM in locals to access them in templates.
    res.locals.PrismicDOM = PrismicDOM
    Prismic.api(PrismicConfig.apiEndpoint, {
      accessToken: PrismicConfig.accessToken,
      req,
    })
      .then(api => {
        req.prismic = { api }
        next()
      })
      .catch(error => {
        next(error.message)
      })
  })

  app.show = (pathname, name, getContext = () => Promise.resolve({})) => {
    const render = async (req, res) => {
      const [aboutData, contactsData, context] = await Promise.all([
        fetchAbout(req.prismic.api),
        fetchContacts(req.prismic.api),
        getContext(req),
      ])

      res.render(name, {
        ...aboutData,
        ...contactsData,
        ...context,
      })
    }

    app.get(pathname, render)
  }

  return app
})()
