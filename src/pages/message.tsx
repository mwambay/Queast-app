import { useState } from 'react'

export function Message() {
  const [content, setContent] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }

  return (
    <div>
      <textarea value={content} onChange={handleChange} /><br />
      <button onClick={() => alert(content)}>Show Alert</button>
      <p>{content}</p>
    </div>
  )
}
