const Prismic = require('prismic-javascript')

module.exports.fetchNews = async (api, pageSize, page = 1) => {
  const { results, total_pages } = await api.query(
    Prismic.Predicates.at('document.type', 'news'),
    { orderings: '[document.first_publication_date desc]', pageSize, page },
  )

  const news = results.map(({ data: { title, photos, content }, id }) => ({
    id,
    title: title[0].text,
    preview: photos[0].photo.url,
    description: content[0].text,
  }))

  return { news, totalPages: total_pages }
}
