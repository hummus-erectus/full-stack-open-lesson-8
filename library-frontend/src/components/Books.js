import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const { loading, data } = useQuery(ALL_BOOKS, {
    variables: selectedGenre && { genre: selectedGenre }
  })

  const allBooksData = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (loading)  {
    return <div>loading...</div>
  }

  const books = data.allBooks

  const genres = [...new Set(allBooksData.data.allBooks.flatMap(book => book.genres))]

  return (
    <div>
      <h2>books</h2>
      {selectedGenre ?
        <p>Filered genre: <strong>{selectedGenre}</strong></p>
        :
        <p>Displaying all genres</p>
      }
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
      {genres.map(genre => (
        <button key={genre} onClick={() => setSelectedGenre(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => setSelectedGenre(null)}>all genres</button>
    </div>
  )
}

export default Books
