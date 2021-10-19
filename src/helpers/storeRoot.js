import React, {createContext } from 'react'
import rcStore from '../root/rcStore'

export const RootContext = createContext()

export const storeState = {
    isDispatch: true, // if this false then store will not dispatch
    rcStore: null,
    rawStore: null
}

export const getStore = () => storeState.rcStore
export const useStore = () => storeState.rcStore
export const rawStore = () => storeState.rawStore
export const useConfig = () => storeState.config
export const storeID = () => storeState.rcStore.storeID


export const rawStoreInit = (config) => {
    if(config.rawStore === true){
        storeState.rawStore = new rcStore(config)
    }
}


export const useMeta = (key, def) => {
    const store = useStore()
    return [
        store.getMeta(key, def),
        (value) => {
            store.addMeta(key, value)
        }
    ]
}