import React from 'react'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/Editor'
import LiveSite from './pages/LiveSite'
import Pricing from './pages/Pricing'
import About from './pages/About'

export const serverUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
function ProtectedRoute({ children }) {
  const { userData, loading } = useSelector(state => state.user)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060713] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return userData ? children : <Home />
}

function App() {
  useGetCurrentUser()
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/about' element={<About/>}/>
    <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
    <Route path='/generate' element={<ProtectedRoute><Generate/></ProtectedRoute>}/>
    <Route path='/editor/:id' element={<ProtectedRoute><WebsiteEditor/></ProtectedRoute>}/>
    <Route path='/site/:id' element={<LiveSite/>}/>
    <Route path='/pricing' element={<Pricing/>}/>
   </Routes>
   </BrowserRouter>
  )
}

export default App
