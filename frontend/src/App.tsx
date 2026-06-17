import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Join from './pages/Join'
import Results from './pages/Results'
import Swipe from './pages/Swipe'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/swipe/:participantId" element={<Swipe />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}
