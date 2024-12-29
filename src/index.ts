"use client"
import { useEffect, useId, useState, createElement, Fragment, Component } from 'react'
import { ArgsType, IStateHandler, RowType, StateDataType, WhereType } from './types';
import Finder, { isOb } from './Finder';
export * from './types'

export class StoreComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
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

export const createStore = <Row extends object, MetaProps extends object = {}>(rows: Row[], meta: MetaProps) => {

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

    const fire = (type: StateDataType) => {
        factory.observe[type] = Math.random()
        factory.dispatches[type].forEach((cb, key) => {
            try {
                cb()
            } catch (_err) {
                factory.dispatches[type].delete(key)
            }
        })
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

    for (let row of rows) {
        factory.data.state.push(_row(row))
    }
    for (let key in meta) {
        factory.data.meta.set(key, meta[key])
    }

    abstract class StateHandler {

        static create(row: Row, freeze?: boolean): RowType<Row> {
            const r = _row<Row>(row as any)
            factory.data.state.push(r)
            if (!freeze) {
                fire("state")
            }
            return r
        }

        static createMany(rows: Row[], freeze?: boolean): RowType<Row>[] {

            const rs = []
            for (let row of rows) {
                const r = _row<Row>(row)
                factory.data.state.push(r)
                rs.push(r)
            }
            if (!freeze) {
                fire("state")
            }
            return rs
        }

        static update(row: Partial<Row>, where: WhereType<Row>, freeze?: boolean) {
            Finder(factory.data.state, where, {
                getRow: (r, index) => {
                    factory.data.state[index] = _row<Row>({ ...r, ...row })
                }
            })

            if (!freeze) {
                fire("state")
            }
        }

        static updateAll(row: Partial<Row>, freeze?: boolean) {

            for (let i = 0; i < factory.data.state.length; i++) {
                factory.data.state[i] = _row<Row>({ ...factory.data.state[i], ...row })
            }
            if (!freeze) {
                fire("state")
            }
        }

        static delete(where: WhereType<Row>, freeze?: boolean) {
            const found = Finder(factory.data.state, where)
            factory.data.state = factory.data.state.filter((row) => !found.ids.includes(row._id))

            if (!freeze) {
                fire("state")
            }
        }
        static move(oldIdx: number, newIdx: number, freeze?: boolean) {
            const row: any = factory.data.state[oldIdx]
            if (row) {
                factory.data.state.splice(oldIdx, 1)
                factory.data.state.splice(newIdx, 0, _row(row))
                if (!freeze) {
                    fire("state")
                }
            }
        }
        static clearAll(freeze?: boolean) {
            factory.data.state = []
            if (!freeze) {
                fire("state")
            }
        }

        static getAll(args?: ArgsType<Row>) {
            try {
                if (!args?.freeze) {
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
                if (!args?.freeze) {
                    useHook("state")
                }
                const cacheKey = factory.observe.state.toString() + (args?.skip || "") + (args?.take || "") + JSON.stringify(where)
                const items = factory.cache.get(cacheKey)
                if (items?.length) {
                    // return items
                }
                const rows = Finder(factory.data.state, where, args).rows
                factory.cache.set(cacheKey, rows)
                return rows
            } catch (error) {
                return Finder(factory.data.state, where, args).rows
            }
        }

        static findFirst(where: WhereType<Row>, freeze?: boolean) {
            return StateHandler.find(where, { freeze })[0]
        }

        static findById(_id: string, freeze?: boolean) {
            return StateHandler.findFirst({ _id }, freeze)
        }

        static setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T], freeze?: boolean) {
            factory.data.meta.set(key, value)
            if (!freeze) {
                fire("meta")
            }
        }

        static getMeta<T extends keyof MetaProps>(key: T, freeze?: boolean): MetaProps[T] {
            try {
                if (!freeze) {
                    useHook("meta")
                }
                return factory.data.meta.get(key)
            } catch (error) {
                return factory.data.meta.get(key)
            }
        }

        static getAllMeta(freeze?: boolean): MetaProps {
            try {
                if (!freeze) {
                    useHook("meta")
                }
                return Object.fromEntries(factory.data.meta) as MetaProps
            } catch (error) {
                return Object.fromEntries(factory.data.meta) as MetaProps
            }
        }

        static deleteMeta<T extends keyof MetaProps>(key: T, freeze?: boolean) {
            factory.data.meta.delete(key)
            if (!freeze) {
                fire("meta")
            }
        }

        static clearMeta(freeze?: boolean) {
            factory.data.meta.clear()
            if (!freeze) {
                fire("meta")
            }
        }
    }

    return StateHandler as IStateHandler<Row, MetaProps>
}

