"use client"
import React, { useEffect, useId, useMemo, useState } from 'react'
import { ArgsType, RowType, WhereType } from './types';
import Finder from './Finder';


const _row = <R,>(row: Partial<R>): RowType<R> => {
    const _id = (row as any)?._id || _uid(row)
    let _observe = (row as any)._observe || Date.now()
    return { ...row, _id, _observe } as any
}

const _cacheKey = (where: object) => JSON.stringify(where)

const _uid = <R,>(row: Partial<R>) => {
    let str = JSON.stringify(row) + Date.now().toString()
    var hash = 0, len = str.length;
    for (var i = 0; i < len; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return parseInt(hash.toString(4)).toString(32).replace("-", "").substring(0, 15)
}


let activeDispatch = true
export const noDispatch = (cb: Function) => {
    activeDispatch = false
    cb()
    activeDispatch = true
}


export const createState = <Row extends object, MetaProps>() => {
    let DATA: RowType<Row>[] = []
    let META = new Map<keyof MetaProps, any>()
    const CACHE = new Map<string, RowType<Row>[]>
    const STATE_INFO = {
        dispatches: new Map<string, Function>(),
        observe: 0,
        meta_observe: 0
    }


    const _dispatch_store = () => {
        STATE_INFO.observe = Math.random()
        CACHE.clear()
        if (activeDispatch) {
            STATE_INFO.dispatches.forEach(d => d())
        }
    }

    const _dispatch_meta = () => {
        STATE_INFO.meta_observe = Math.random()
        if (activeDispatch) {
            STATE_INFO.dispatches.forEach(d => d())
        }
    }

    abstract class StateFactory {

        static create(row: Partial<Row>): RowType<Row> {
            const r = _row<Row>(row)
            DATA.push({ ...r, _index: DATA.length + 1 })
            _dispatch_store()
            CACHE.clear()
            return r
        }

        static createMany(rows: Row[]) {
            for (let row of rows) {
                const r = _row<Row>(row)
                DATA.push({ ...r, _index: DATA.length + 1 })
            }
            _dispatch_store()
        }

        static update(row: Partial<Row>, where: WhereType<Row>, args?: ArgsType<Row>) {
            Finder(DATA, where, {
                ...args,
                getRow: (r, index) => {
                    args?.getRow && args.getRow(r, index)
                    DATA[index] = _row<Row>({ ...r, ...row })
                }
            })
            _dispatch_store()
        }

        static updateAll(row: Partial<Row>) {
            for (let i = 0; i < DATA.length; i++) {
                DATA[i] = _row<Row>({ ...DATA[i], ...row })
            }
            _dispatch_store()
        }

        static delete(where: WhereType<Row>, args?: ArgsType<Row>) {
            const found = Finder(DATA, where, args)
            for (let index of found.indexes) {
                DATA.splice(index, 1)
            }
            _dispatch_store()
        }

        static deleteAll() {
            DATA = []
            _dispatch_store()
        }

        static getAll() {
            try {
                const id = useId()
                const [, dispatch] = useState(0)
                useEffect(() => {
                    STATE_INFO.dispatches.set(id, () => dispatch(Math.random()))
                    return () => {
                        STATE_INFO.dispatches.delete(id)
                    }
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
                useEffect(() => {
                    STATE_INFO.dispatches.set(id, () => dispatch(Math.random()))
                    return () => {
                        STATE_INFO.dispatches.delete(id)
                    }
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

        static getIndex(where: WhereType<Row>): number | void {
            const d = StateFactory.findFirst(where)
            return d && d._index
        }

        static move(oldIdx: number, newIdx: number) {
            const row: any = DATA[oldIdx]
            if (row) {
                DATA.splice(oldIdx, 1)
                DATA.splice(newIdx, 0, _row(row))
                _dispatch_store()
            }
        }

        // ============ Meta
        setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
            META.set(key, value)
            _dispatch_meta()
        }

        getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T] {
            try {
                const id = useId()
                const [, dispatch] = useState(0)
                useEffect(() => {
                    STATE_INFO.dispatches.set(id, () => dispatch(Math.random()))
                    return () => {
                        STATE_INFO.dispatches.delete(id)
                    }
                }, [])
                return META.get(key) || def
            } catch (error) {
                return META.get(key) || def
            }
        }

        getAllMeta(): MetaProps {
            try {
                const id = useId()
                const [, dispatch] = useState(0)
                useEffect(() => {
                    STATE_INFO.dispatches.set(id, () => dispatch(Math.random()))
                    return () => {
                        STATE_INFO.dispatches.delete(id)
                    }
                }, [])
                return useMemo(() => {
                    let metas: any = {}
                    META.forEach((v, k) => {
                        metas[k] = v
                    })
                    return metas
                }, [STATE_INFO.meta_observe])
            } catch (error) {
                let metas: any = {}
                META.forEach((v, k) => {
                    metas[k] = v
                })
                return metas
            }
        }

        deleteMeta<T extends keyof MetaProps>(key: T) {
            META.delete(key)
            _dispatch_meta()
        }

        deleteAllMeta() {
            META.clear()
            _dispatch_meta()
        }

        // ============= Util



    }

    return StateFactory
}

export class StoreComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    constructor(props: P) {
        super(props)
        const R = this.render.bind(this)
        this.render = () => <><R /></>
    }
}
