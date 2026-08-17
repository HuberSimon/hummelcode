import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

import Home from './pages/public/Home'
import Authentication from './pages/public/Authentication'
import Dashboard from './pages/protected/Dashboard'

import { AuthProvider, useAuth } from './context/AuthContext'

import Layout from './layouts/BasicLayout'
import type { JSX } from 'react'
import QRRedirect from './pages/protected/QRRedirect'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>

            <Route
              path="/"
              element={
                  <HomeForward />
              }
            />

            <Route
              path="/login"
              element={
                  <LoginRedirect />
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/qr/:id"
              element={<QRRedirect />}
            />

          </Routes>
        </motion.div>
      </AnimatePresence>
      </Layout>
    </>
  )
}

const LoginRedirect = () => {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" />
  return <Authentication />
}

const HomeForward = () => {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" />
  return <Home />
}

function App() {
  return (
    <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <AnimatedRoutes />
        </Router>
    </AuthProvider>
  )
}

export default App