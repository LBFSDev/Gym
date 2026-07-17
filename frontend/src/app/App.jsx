import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '@/context/AuthContext';
import { AuthProvider } from "../features/auth/AuthContext.jsx";
import Routes from './routes.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      
            <AuthProvider>
        <Routes />
      </AuthProvider>
          
    </BrowserRouter>
  )
}

export default App
