"use client"
import { useEffect, useId, useState, createElement, Fragment, Component } from 'react'
import { ArgsType, IStateHandler, RowType, StateDataType, WhereType } from './types';
import Finder, { isOb } from './Finder';
export * from './types'

export class StateComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
    constructor(props: P) {
        super(props)
        const R = this.render.bind(this) as any
        this.render = () => createElement(Fragment, null, createElement(R, null))
    }
}

const _random = () => Date.now() + Math.floor(1000 + Math.random() * 9000)
const _uid = () => _random().toString(32).replace("-", "").substring(0, 15)
const _row = <R>(row: Partial<RowType<R>>): RowType<R> => {
    if (!isOb(row)) throw new Error(`State row must be an object. given ${typeof row}: ${row}`);
    return { ...row, _id: row._id || _uid(), _observe: row._observe || _random() } as any
}

let doDispatch = true
export const noDispatch = (cb: Function) => {
    doDispatch = false
    cb()
    doDispatch = true
}

export const createState = <Row extends object, MetaProps extends object = {}>() => {

    const factory = {
        data: {
            state: [] as RowType<Row>[],
            meta: new Map<keyof MetaProps, any>()
        },
        dispatches: {
            state: new Map<string, Function>(),
            meta: new Map<string, Function>()
        },
        observe: {
            state: Math.random(),
            meta: Math.random()
        },
        cache: new Map<string, RowType<Row>[]>()
    }

    const _dispatch = (type: StateDataType) => {
        factory.observe[type] = Math.random()

        if (doDispatch) {
            factory.dispatches[type].forEach((cb, key) => {
                try {
                    cb()
                } catch (_err) {
                    factory.dispatches[type].delete(key)
                }
            })
        }
    }

    const useHook = (type: StateDataType) => {
        const id = useId()
        const [, dispatch] = useState(0)
        useEffect(() => {
            factory.dispatches[type].set(id, () => dispatch(Math.random()))
            return () => {
                factory.dispatches[type].delete(id)
            }
        }, [])
    }

    abstract class StateHandler {

        static create(row: Row, args?: ArgsType<Row>): RowType<Row> {
            const r = _row<Row>(row as any)
            factory.data.state.push(r)
            if (!args?.noDispatch) {
                _dispatch("state")
            }
            return r
        }

        static createMany(rows: Row[], args?: ArgsType<Row>): RowType<Row>[] {
            const rs = []
            for (let row of rows) {
                const r = _row<Row>(row)
                factory.data.state.push(r)
                rs.push(r)
            }
            if (!args?.noDispatch) {
                _dispatch("state")
            }
            return rs
        }

        static update(row: Partial<Row>, where: WhereType<Row>, args?: ArgsType<Row>) {
            Finder(factory.data.state, where, {
                ...args,
                getRow: (r, index) => {
                    args?.getRow && args.getRow(r, index)
                    factory.data.state[index] = _row<Row>({ ...r, ...row })
                }
            })

            if (!args?.noDispatch) {
                _dispatch("state")
            }
        }

        static updateAll(row: Partial<Row>, args?: ArgsType<Row>) {
            for (let i = 0; i < factory.data.state.length; i++) {
                factory.data.state[i] = _row<Row>({ ...factory.data.state[i], ...row })
            }
            if (!args?.noDispatch) {
                _dispatch("state")
            }
        }

        static delete(where: WhereType<Row>, args?: ArgsType<Row>) {
            const found = Finder(factory.data.state, where, args)
            factory.data.state = factory.data.state.filter((row) => !found.ids.includes(row._id))

            if (!args?.noDispatch) {
                _dispatch("state")
            }
        }

        static clearAll() {
            factory.data.state = []
            _dispatch("state")
        }

        static getAll(args?: ArgsType<Row>) {
            try {
                if (!args?.noDispatch) {
                    useHook("state")
                }
                const cacheKey = factory.observe.state.toString() + (args?.skip || "") + (args?.take || "")
                const items = factory.cache.get(cacheKey)
                if (items?.length) {
                    return items
                }
                const rows = Finder(factory.data.state, null, args).rows
                factory.cache.set(cacheKey, rows)
                return rows
            } catch (error) {
                return Finder(factory.data.state, null, args)
            }
        }

        static find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[] {
            try {

                if (!args?.noDispatch) {
                    useHook("state")
                }
                const cacheKey = factory.observe.state.toString() + (args?.skip || "") + (args?.take || "") + JSON.stringify(where)
                const items = factory.cache.get(cacheKey)
                if (items?.length) {
                    return items
                }
                const rows = Finder(factory.data.state, where, args).rows
                factory.cache.set(cacheKey, rows)
                return rows
            } catch (error) {
                return Finder(factory.data.state, where, args).rows
            }
        }

        static findFirst(where: WhereType<Row>) {
            return StateHandler.find(where)[0]
        }

        static findById(_id: string) {
            return StateHandler.findFirst({ _id })
        }

        static move(oldIdx: number, newIdx: number) {
            const row: any = factory.data.state[oldIdx]
            if (row) {
                factory.data.state.splice(oldIdx, 1)
                factory.data.state.splice(newIdx, 0, _row(row))
                _dispatch("state")
            }
        }

        static setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
            factory.data.meta.set(key, value)
            _dispatch("meta")
        }

        static getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T] {
            try {
                useHook("meta")
                return factory.data.meta.get(key) || def
            } catch (error) {
                return factory.data.meta.get(key) || def
            }
        }

        static getAllMeta(): MetaProps {
            try {
                useHook("meta")
                return Object.fromEntries(factory.data.meta) as MetaProps
            } catch (error) {
                return Object.fromEntries(factory.data.meta) as MetaProps
            }
        }

        static deleteMeta<T extends keyof MetaProps>(key: T) {
            factory.data.meta.delete(key)
            _dispatch("meta")
        }

        static clearMeta() {
            factory.data.meta.clear()
            _dispatch("meta")
        }
    }

    return StateHandler as IStateHandler<Row, MetaProps>
}

