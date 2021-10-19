import React, {useEffect} from 'react'
import Provider from './Provider'
import {storeState, rawStoreInit} from './storeRoot'
import initStore from './initStore'
import { is_object } from "../utils";

const Root = ({RootComp, props}) => {
    const store = initStore()
    const {onReady, onUpdate} = storeState.config
   
    if(typeof onReady === 'function'){
        useEffect(() => {
            onReady(store)
        }, []);
    }

    if(typeof onUpdate === 'function'){
        useEffect(() => {
            onUpdate(store)
        }, [store.storeInfo().updated]);
    }
    if(!is_object(props)){
        props = {}
    }

    return <RootComp {...props} />
}

const createStore = (RootComp, config) => {
    
    rawStoreInit(config)


    const Prov = (props) => (
        <Provider config={config}>
            <Root RootComp={RootComp} props={props}/>
        </Provider>
    )

    return Prov
}

export default createStore