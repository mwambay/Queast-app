import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SERVER_UNREACHABLE_EVENT, type ServerUnreachableDetail } from './lib/api'

function App() {
  const [count, setCount] = useState(0)
  const [serverDown, setServerDown] = useState<null | ServerUnreachableDetail>(null)

  useEffect(() => {
    const onDown = (e: Event) => {
      const ce = e as CustomEvent<ServerUnreachableDetail>
      setServerDown(ce.detail || { url: '' })
    }
    window.addEventListener(SERVER_UNREACHABLE_EVENT, onDown as EventListener)
    return () => window.removeEventListener(SERVER_UNREACHABLE_EVENT, onDown as EventListener)
  }, [])

  return (
    <>
      {serverDown && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#0b74da', color: 'white', padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <span>
            Impossible de joindre le serveur. Vérifiez votre connexion ou réessayez plus tard.
          </span>
          <button onClick={() => setServerDown(null)} style={{
            background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer'
          }}>Fermer</button>
        </div>
      )}
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1></h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
