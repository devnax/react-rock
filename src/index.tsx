"use client"
import React, { useId, useMemo, useState } from 'react'
import { ArgsType, RowType, WhereType } from './types';
import Finder, { QueryType } from './Finder';


const _row = <R,>(row: R): RowType<R> => {
    const _id = (row as any)?._id || _uid(row)
    let _observe = (row as any)._observe || Date.now().toString()
    return { ...row, _id, _observe } as any
}

const _cacheKey = (where: object) => JSON.stringify(where)

const _uid = <R,>(row: R) => {
    let str = JSON.stringify(row) + Date.now().toString()
    var hash = 0, len = str.length;
    for (var i = 0; i < len; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return parseInt(hash.toString(4)).toString(32).replace("-", "").substring(0, 15)
}


export const noDispatch = () => { }


export const createState = <Row extends object, MetaProps>() => {
    let DATA: RowType<Row>[] = []
    let META = new Map<keyof MetaProps, any>()
    const CACHE = new Map<string, RowType<Row>[]>
    const STATE_INFO = {
        dispatches: {} as { [id: string]: Function },
        observe: 0
    }


    const _dispatch = () => {
        STATE_INFO.observe = Math.random()
        CACHE.clear()
        for (let id in STATE_INFO.dispatches) {
            const dispatch = STATE_INFO.dispatches[id]
            dispatch()
        }
    }

    abstract class StateFactory {

        static create(row: Row): RowType<Row> {
            const r = _row<Row>(row)
            DATA.push(r)
            _dispatch()
            CACHE.clear()
            return r
        }

        static createMany(rows: Row[]) {
            for (let row of rows) {
                const r = _row<Row>(row)
                DATA.push(r)
            }
            _dispatch()
        }

        static update(row: Partial<Row>, where: WhereType<Row>, args?: ArgsType<Row>) {
            Finder(DATA, where, {
                ...args,
                getRow: (r, index) => {
                    args?.getRow && args.getRow(r, index)
                    DATA[index] = _row({ ...r, ...row })
                }
            })
            _dispatch()
        }

        static updateAll(row: Partial<Row>) {
            for (let i = 0; i < DATA.length; i++) {
                DATA[i] = _row({
                    ...DATA[i],
                    ...row
                })
            }
            _dispatch()
        }

        static delete(where: WhereType<Row>, args?: ArgsType<Row>) {
            const found = Finder(DATA, where, args)
            for (let index of found.indexes) {
                DATA.splice(index, 1)
            }
            _dispatch()
        }

        static deleteAll() {
            DATA = []
            _dispatch()
        }

        static getAll() {
            try {
                const id = useId()
                const [, dispatch] = useState(0)
                useMemo(() => {
                    STATE_INFO.dispatches[id] = () => dispatch(Math.random())
                }, [])
                return DATA
            } catch (error) {
                return DATA
            }
        }

        static find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[] {
            try {
                const id = useId()
                const [, dispatch] = useState(0)
                useMemo(() => {
                    STATE_INFO.dispatches[id] = () => dispatch(Math.random())
                }, [])

                return useMemo(() => {
                    const cacheKey = _cacheKey(where)
                    const has = CACHE.get(cacheKey)
                    if (has) return has
                    const found = Finder(DATA, where, args)
                    CACHE.set(cacheKey, found.rows)
                    return found.rows

                }, [STATE_INFO.observe])
            } catch (error) {
                const found = Finder(DATA, where, args)
                return found.rows
            }
        }

        static findFirst(where: WhereType<Row>) {
            const found = StateFactory.find(where)
            if (found.length) return found[0]
        }

        static findById(_id: string) {
            return StateFactory.findFirst({ _id })
        }

        // ============ Meta
        setMeta() { }
        getMeta() { }
        deleteMeta() { }
        clearMeta() { }

        // ============= Util

        static move() { }
        static getIndex() { }

    }

    return StateFactory
}

export class StoreComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    constructor(props: P) {
        super(props)
        const R = this.render
        this.render = () => <><R /></>
    }
}
