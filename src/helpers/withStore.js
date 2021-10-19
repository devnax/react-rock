import React, {useMemo, memo, createElement } from 'react'
import {useStore} from './storeRoot'
import {is_string, is_array} from '../utils'


export default (Comp, resolve) => {
    if(is_string(resolve)){
        return (props) => {
            let store = useStore()
            let deps  = {}
            if(props[resolve]){
                deps[resolve] = props[resolve]
            }
            deps      = deps && Object.keys(deps).length ? deps : props
            return useMemo(() => createElement(Comp, {...props, ...deps, store}), Object.values(deps))
        }
    }else if(is_array(resolve)){
        return (props) => {
            let store = useStore()
            let deps  = {}
            for (let  i of  resolve) {
               if(props[i]){
                    deps[i] = props[i]
                }
            }
            deps  = deps && Object.keys(deps).length ? deps : props
            return useMemo(() => createElement(Comp, {...props, ...deps, store}), Object.values(deps))
        }
    }else if(typeof resolve === 'function'){
        return (props) => {
            let store = useStore()
            let deps  = resolve({...props, store})
            deps      = deps ? deps : props
            return useMemo(() => createElement(Comp, {...props, ...deps, store}), Object.values(deps))
        }
    }
    return memo((props) => createElement(Comp, {...props, store: useStore()}))
}