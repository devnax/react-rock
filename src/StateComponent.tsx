"use client"
import React from 'react'

export class StateComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    constructor(props: P) {
        super(props)
        const R = this.render.bind(this) as any
        this.render = () => <><R /></>
    }
}
