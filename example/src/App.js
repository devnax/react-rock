import React from 'react'

import { createStore, useStore, useMeta, rawStore } from 'react-rock'

const MainApp = ({children}) => {
  return (
    <h1>{children}</h1>
  )
}


const App = () => {
  const store = useStore()
  const [a, s] = useMeta('a', false)
  return <MainApp >
    {a.toString()}
    <button onClick={() => s(!a)}>Click</button>
    Create React Library Example 😄 
  </MainApp>
}


const StoreRoot = createStore(App, {rawStore: true})



const s = rawStore()
console.log(s);

export default StoreRoot
