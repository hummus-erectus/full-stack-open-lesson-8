import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useState } from 'react'


const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)

  const [author, setAuthor] = useState('')
  const [born, setBorn] = useState('')

  const [ changeBorn ] = useMutation(EDIT_AUTHOR)

  // useEffect(() => {
  //   if (updatedAuthor.data && updatedAuthor.data.editAuthor === null) {
  //     setError('person not found')
  //   }
  // }, [updatedAuthor.data]) // eslint-disable-line


  if (!props.show) {
    return null
  }

  if (result.loading)  {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()

    changeBorn({ variables: { name: author, setBornTo: parseInt(born) } })

    setAuthor('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token ?
        <>
          <h2>Set birthyear</h2>
          <form onSubmit={submit}>
          <div>
              Author
              <select value={author} onChange={({ target }) => setAuthor(target.value)}>
              <option value="" disabled>Select author</option>
                {authors.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              born
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
        :
        null
      }
    </div>
  )
}

export default Authors
