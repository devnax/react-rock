import React, {useContext} from 'react'
import {RootContext, storeState} from './storeRoot'
import rcStore from '../root/rcStore'
import { is_object, is_array } from "../utils";


const InitStore =  () => {
    
    const context = useContext(RootContext)
    if(!context) return


    if(storeState.rcStore) return storeState.rcStore

    let [ ,dispatch] = context
    storeState.dispatchOn  = false
    storeState.dispatch    = dispatch
    
    const rootMathods = {

        // modify the store without dispatch
        noDispatch: (cb) => {
            storeState.isDispatch = false
            cb()
            storeState.isDispatch = true
        },

        dispatch: (cb) => {
            storeState.isDispatch = false
            cb()
            dispatch({rand: Math.random()})
            storeState.isDispatch = true
        },
    }

    const {tables, keys, methods} = storeState.config

    // Store Setup
    storeState.rcStore = new rcStore({
        tables: is_array(tables) ? tables : [],
        keys: is_object(keys) ? keys : {},
        methods: {
            ...(is_object(methods) ? methods : {}),
            ...rootMathods,
        },
        onUpdate: () => {
            if(storeState.isDispatch){
                dispatch({rand: Math.random()})
            }
        }
    })

    return storeState.rcStore
}

export default InitStore