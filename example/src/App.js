import React from 'react'

import { createStore, useStore } from 'react-rock'
import 'react-rock/dist/index.css'

const MainApp = ({children}) => {
  return (
    <h1>{children}</h1>
  )
}

const StoreRoot = createStore(MainApp, {})

const App = () => {
  const store = useStore()
  return <StoreRoot >
    Create React Library Example 😄 
  </StoreRoot>
}

export default App
