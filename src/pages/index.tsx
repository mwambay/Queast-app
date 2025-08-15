import { useState } from 'react'

export function Index() {
    const [content, setContent] = useState('')

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(event.target.value)
    }

    return (
        <div>
            <textarea value={content} onChange={handleChange} />
            <p>{content}</p>
        </div>
    )
}