import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommendations = (props) => {
  const result = useQuery(ALL_BOOKS)
  const userResult = useQuery(ME, {
    skip: !localStorage.getItem("library-user-token")
  })

  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }
  const favoriteGenre = userResult.data.me.favoriteGenre
  const books = result.data.allBooks.filter(book => book.genres.includes(favoriteGenre))
  console.log(userResult)
  return (
    <div>
      <h2>Recommendations</h2>
        <p>Books in your favorite genre: <strong>{favoriteGenre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations