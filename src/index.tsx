"use client"
import React, { useEffect, useId, useMemo, useState } from 'react'
import { ArgsType, RowType, WhereType } from './types';
import Finder from './Finder';
export * from './types'

type DataType = "state" | "meta"

const _row = <R,>(row: Partial<RowType<R>>): RowType<R> => {
    return {
        ...row,
        _id: row._id || _uid(),
        _observe: row._observe || _random()
    } as any
}

const _random = () => Date.now() + Math.floor(1000 + Math.random() * 9000)
const _uid = () => _random().toString(32).replace("-", "").substring(0, 15)

let activeDispatch = true
export const noDispatch = (cb: Function) => {
    activeDispatch = false
    cb()
    activeDispatch = true
}


export const createState = <Row extends object, MetaProps>() => {
    let DATA: RowType<Row>[] = []
    let META = new Map<keyof MetaProps, any>()
    const STATE_INFO = {
        dispatches: new Map<string, { type: DataType, cb: Function }>(),
        observe: 0,
        meta_observe: 0
    }

    const _dispatch = (type: DataType) => {
        STATE_INFO.observe = Math.random()
        if (activeDispatch) {
            STATE_INFO.dispatches.forEach(d => {
                d.type === type && d.cb()
            })
        }
    }

    const useHook = (type: DataType) => {
        const id = useId()
        const [, dispatch] = useState(0)
        useEffect(() => {
            STATE_INFO.dispatches.set(id, { type, cb: () => dispatch(Math.random()) })
            return () => {
                STATE_INFO.dispatches.delete(id)
            }
        }, [])
    }

    abstract class StateFactory {

        static create(row: Partial<Row>): RowType<Row> {
            const r = _row<Row>(row as any)
            DATA.push({ ...r, _index: DATA.length + 1 })
            _dispatch("state")
            return r
        }

        static createMany(rows: Row[]) {
            for (let row of rows) {
                const r = _row<Row>(row)
                DATA.push({ ...r, _index: DATA.length + 1 })
            }
            _dispatch("state")
        }

        static update(row: Partial<Row>, where: WhereType<Row>, args?: ArgsType<Row>) {
            Finder(DATA, where, {
                ...args,
                getRow: (r, index) => {
                    args?.getRow && args.getRow(r, index)
                    DATA[index] = _row<Row>({ ...r, ...row })
                }
            })
            _dispatch("state")
        }

        static updateAll(row: Partial<Row>) {
            for (let i = 0; i < DATA.length; i++) {
                DATA[i] = _row<Row>({ ...DATA[i], ...row })
            }
            _dispatch("state")
        }

        static delete(where: WhereType<Row>, args?: ArgsType<Row>) {
            const found = Finder(DATA, where, args)
            for (let index of found.indexes) {
                DATA.splice(index, 1)
            }
            _dispatch("state")
        }

        static deleteAll() {
            DATA = []
            _dispatch("state")
        }

        static getAll() {
            try {
                useHook("state")
                return DATA
            } catch (error) {
                return DATA
            }
        }

        static find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[] {
            try {
                useHook("state")
                return useMemo(() => Finder(DATA, where, args).rows, [STATE_INFO.observe])
            } catch (error) {
                return Finder(DATA, where, args).rows
            }
        }

        static findFirst(where: WhereType<Row>) {
            return StateFactory.find(where)[0]
        }

        static findById(_id: string) {
            return StateFactory.findFirst({ _id })
        }

        static move(oldIdx: number, newIdx: number) {
            const row: any = DATA[oldIdx]
            if (row) {
                DATA.splice(oldIdx, 1)
                DATA.splice(newIdx, 0, _row(row))
                _dispatch("state")
            }
        }

        setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
            META.set(key, value)
            _dispatch("meta")
        }

        getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T] {
            try {
                useHook("meta")
                return META.get(key) || def
            } catch (error) {
                return META.get(key) || def
            }
        }

        getAllMeta(): MetaProps {
            try {
                useHook("meta")
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
            _dispatch("meta")
        }

        deleteAllMeta() {
            META.clear()
            _dispatch("meta")
        }

    }

    return StateFactory
}

export class StateComponent<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    constructor(props: P) {
        super(props)
        const R = this.render.bind(this) as any
        this.render = () => <><R /></>
    }
}
