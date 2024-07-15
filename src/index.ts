import { useEffect, useId, useMemo, useState } from 'react'
import { ArgsType, IStateHandler, RowType, StateDataType, WhereType } from './types';
import Finder from './Finder';
export * from './types'
export * from './StateComponent'

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

export const createState = <Row extends object, MetaProps extends object = {}>() => {
    let DATA: RowType<Row>[] = []
    let META = new Map<keyof MetaProps, any>()
    const STATE_INFO = {
        dispatches: new Map<string, { type: StateDataType, cb: Function }>(),
        observe: 0,
        meta_observe: 0
    }

    const _dispatch = (type: StateDataType) => {
        STATE_INFO[type == "meta" ? "meta_observe" : "observe"] = Math.random()
        activeDispatch && STATE_INFO.dispatches.forEach(d => d.type === type && d.cb())
    }

    const useHook = (type: StateDataType) => {
        const id = useId()
        const [, dispatch] = useState(0)
        useEffect(() => {
            STATE_INFO.dispatches.set(id, { type, cb: () => dispatch(Math.random()) })
            return () => {
                STATE_INFO.dispatches.delete(id)
            }
        }, [])
    }

    abstract class StateHandler {

        static create(row: Row): RowType<Row> {
            const r = _row<Row>(row as any)
            DATA.push(r)
            _dispatch("state")
            return r
        }

        static createMany(rows: Row[]) {
            for (let row of rows) {
                const r = _row<Row>(row)
                DATA.push(r)
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

        static clearState() {
            DATA = []
            _dispatch("state")
        }

        static getAll(args?: ArgsType<Row>) {
            try {
                useHook("state")
                return useMemo(() => Finder(DATA, null, args).rows, [STATE_INFO.observe])
            } catch (error) {
                return Finder(DATA, null, args)
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
            return StateHandler.find(where)[0]
        }

        static findById(_id: string) {
            return StateHandler.findFirst({ _id })
        }

        static move(oldIdx: number, newIdx: number) {
            const row: any = DATA[oldIdx]
            if (row) {
                DATA.splice(oldIdx, 1)
                DATA.splice(newIdx, 0, _row(row))
                _dispatch("state")
            }
        }

        static setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]) {
            META.set(key, value)
            _dispatch("meta")
        }

        static getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T] {
            try {
                useHook("meta")
                return META.get(key) || def
            } catch (error) {
                return META.get(key) || def
            }
        }

        static getAllMeta(): MetaProps {
            try {
                useHook("meta")
                return useMemo(() => Object.fromEntries(META) as MetaProps, [STATE_INFO.meta_observe])
            } catch (error) {
                return Object.fromEntries(META) as MetaProps
            }
        }

        static deleteMeta<T extends keyof MetaProps>(key: T) {
            META.delete(key)
            _dispatch("meta")
        }

        static clearMeta() {
            META.clear()
            _dispatch("meta")
        }
    }

    return StateHandler as IStateHandler<Row, MetaProps>
}

