import React, { useReducer, createElement } from 'react'
import {RootContext, storeState} from './storeRoot'
import {is_object} from '../utils'

const Provider = ({config, children}) => {
    storeState.config = is_object(config) ? config : {}
    const state       = useReducer((os, ns) => ({...os,...ns}), {t: Math.random()})
    const {Provider}  = RootContext
    return <Provider value={state}>{children}</Provider>
}

export default Provider