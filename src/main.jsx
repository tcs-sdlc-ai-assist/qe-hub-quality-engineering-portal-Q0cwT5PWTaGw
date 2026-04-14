import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeStorage } from './utils/storageUtils'
import { seedMockData } from './constants/mockData'

initializeStorage()
seedMockData()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)