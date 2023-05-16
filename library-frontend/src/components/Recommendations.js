import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommendations = (props) => {
  const userResult = useQuery(ME, {
    skip: !localStorage.getItem("library-user-token")
  })

  const favoriteGenre = userResult.data?.me?.favoriteGenre || ''

  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: favoriteGenre && { genre: favoriteGenre }
  })

  if (!props.show) {
    return null
  }

  if (loading)  {
    return <div>loading...</div>
  }
  const books = data.allBooks
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