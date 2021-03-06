const Onboarding = require('./onboarding')
const app = require('./config')
const { fetchNew } = require('./content/fetchNew')
const { fetchNews } = require('./content/fetchNews')
const { fetchDocs } = require('./content/fetchDocs')
const { fetchAlbums } = require('./content/fetchAlbums')
const { fetchAlbum } = require('./content/fetchAlbum')
const { fetchArticle } = require('./content/fetchArticle')
const { fetchArticles } = require('./content/fetchArticles')

const PORT = app.get('port')
const dev = process.env.NODE_END !== 'production'

if (dev) {
  const { bundle } = require('./bundle')
  bundle()
}

const getPage = req => parseInt(req.query.page || '1', 10)
const getId = req => req.params.id

app.show('/', 'index', async req => {
  const { news } = await fetchNews(req.prismic.api, 2)

  return { news }
})

app.show('/news', 'news', async req => {
  const page = getPage(req)
  const { news, totalPages } = await fetchNews(req.prismic.api, 6, page)

  return { news, page, totalPages }
})

app.show('/news/:id', 'new', async req => {
  const id = getId(req)
  const item = await fetchNew(req.prismic.api, id)

  return { item }
})

app.show('/articles', 'articles', async req => {
  const page = getPage(req)
  const { articles, totalPages } = await fetchArticles(
    req.prismic.api,
    12,
    page,
  )

  return { articles, page, totalPages }
})

app.show('/articles/:id', 'article', async req => {
  const id = getId(req)
  const item = await fetchArticle(req.prismic.api, id)

  return { item }
})

app.show('/docs', 'docs', async req => {
  const { docs } = await fetchDocs(req.prismic.api)

  return { docs }
})

app.show('/photos', 'photos', async req => {
  const page = getPage(req)
  const { albums, totalPages } = await fetchAlbums(req.prismic.api, 12, page)

  return { albums, page, totalPages }
})

app.show('/photos/:id', 'photo', async req => {
  const id = getId(req)
  const item = await fetchAlbum(req.prismic.api, id)

  return { item }
})

app.listen(PORT, () => {
  Onboarding.trigger()
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`)
})
