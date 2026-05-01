"use client"
import { useEffect, useId, useState } from "react"
import { CreateArgs, CreateManyArgs, DeleteArgs, FindArgs, MakeMetaType, MakeRowType, MetaSchema, MoveArgs, RowSchema, UpdateArgs, WhereType } from "./types"
import { Infer, xv } from "xanv"

const uid = useId as any
const ustate = useState as any
const ueffect = useEffect as any


class Store<RS extends RowSchema, MS extends MetaSchema | undefined = undefined> {
   private _rows: MakeRowType<RS>[] = []
   private _meta: Map<keyof MakeMetaType<MS>, MakeMetaType<MS>[keyof MakeMetaType<MS>]> = new Map()
   private _hooks: Map<string, Function> = new Map()
   private _timer: any = null
   private _row_schema: RS
   private _meta_schema?: MS
   private _last_id = 0

   constructor(rowSchema: RS, metaSchema?: MS) {
      this._row_schema = {
         ...rowSchema,
         rid: xv.number(),
         vid: xv.number().default(() => Math.round((Math.random() + Math.random()) * 9999999999)),
      }
      this._meta_schema = metaSchema
   }

   private observe = (observeId?: string) => {
      try {
         const hid = uid()
         const id = observeId || hid
         const [, dispatch] = ustate(0)
         this._hooks.set(id, () => dispatch(Math.random()))
         ueffect(() => () => {
            this._hooks.delete(id)
         }, [])
      } catch (error) { }
   }

   dispatch(observeIdOrCallbabck?: string | ((cb: Function, key: string) => void)) {
      clearTimeout(this._timer)
      const isFn = typeof observeIdOrCallbabck === "function"
      this._timer = setTimeout(() => {
         this._hooks.forEach((cb, key) => {
            try {
               if (isFn) {
                  observeIdOrCallbabck(cb, key)
               } else {
                  if (observeIdOrCallbabck) {
                     if (key === observeIdOrCallbabck) {
                        cb()
                     }
                  } else {
                     cb()
                  }
               }
            } catch (_err) {
               this._hooks.delete(key)
            }
         })
      }, 0)
   }

   rows(observe = true) {
      observe && this.observe()
      return this._rows
   }

   metas(observe = true) {
      observe && this.observe()
      return this._meta
   }

   createMany(args: CreateManyArgs<RS>) {
      const { data, disablelObservation, observeId } = args
      const res = []
      for (let row of data) {
         const created = this.create({
            data: row,
            disablelObservation: true
         })
         res.push(created)
      }
      if (!disablelObservation) {
         this.dispatch(observeId)
      }
      return res
   }
   // Row Methods
   create(args: CreateArgs<RS>): MakeRowType<RS> | MakeRowType<RS>[] {
      const { data, disablelObservation, observeId } = args
      // validate and create row
      let r: any = {} as MakeRowType<RS>
      for (let key in this._row_schema) {
         if (key === "rid" || key === "vid") continue;
         const schema = this._row_schema[key]
         r[key] = schema.parse(data[key])
      }

      this._last_id = this._last_id + 1;
      const _row: MakeRowType<RS> = {
         ...r,
         rid: this._last_id,
         vid: this._row_schema.vid.parse(undefined),
      }

      this._rows.push(_row)
      if (!disablelObservation) {
         this.dispatch(observeId)
      }
      return _row
   }


   // update
   update(args: UpdateArgs<RS>): MakeRowType<RS>[] | null {
      const { data, where, disablelObservation, observeId } = args
      // validate row
      let r: any = {} as MakeRowType<RS>
      for (let key in data) {
         if (key === "rid" || key === 'vid') continue;
         const schema = this._row_schema[key]
         r[key] = schema.parse(data[key])
      }

      const rows = this.find({ where })
      if (rows.length > 0) {
         for (let index = 0; index < rows.length; index++) {
            const _row = rows[index];
            const rid = _row.rid
            rows[index] = {
               ..._row,
               ...r,
               rid,
               vid: this._row_schema.vid.parse(undefined),
            }
            const rowIndex = this._rows.findIndex(r => r.rid === rid)
            this._rows[rowIndex] = rows[index]
         }
         if (!disablelObservation) {
            this.dispatch(observeId)
         }
      }
      return this.find({ where, disablelObservation: true })
   }

   // delete
   delete(args: DeleteArgs<RS>): number {
      const { where, disablelObservation, observeId } = args
      const rows = this.find({
         where,
         disablelObservation: true
      })

      let deletedCount = 0
      if (rows.length > 0) {
         this._rows = this._rows.filter(r => !rows.find(dr => dr.rid === r.rid))
         deletedCount = rows.length
         if (!disablelObservation) {
            this.dispatch(observeId)
         }
      }
      return deletedCount
   }

   // find
   find(args: FindArgs<RS>): MakeRowType<RS>[] {

      let { where, disablelObservation, observeId } = args

      if (!disablelObservation) {
         this.observe(observeId)
      }

      if (!where) {
         return this._rows
      }
      const rows: MakeRowType<RS>[] = []

      for (const row of this._rows) {
         const match = Object.keys(row).find(column => {
            let _match = true
            const rvalue = row[column]

            for (let wcol in where) {
               const wv = where[wcol]
               if (typeof wv === "object" && wv !== null) {

                  if (wv.contain !== undefined) {
                     if (typeof rvalue === "string" && typeof wv.contain === "string") {
                        if (!rvalue.includes(wv.contain)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }

                  if (wv.startWith !== undefined) {
                     if (typeof rvalue === "string" && typeof wv.startWith === "string") {
                        if (!rvalue.startsWith(wv.startWith)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  if (wv.endWith !== undefined) {
                     if (typeof rvalue === "string" && typeof wv.endWith === "string") {
                        if (!rvalue.endsWith(wv.endWith)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  if (wv.equalWith !== undefined) {
                     if (rvalue !== wv.equalWith) {
                        _match = false
                     }
                  }
                  if (wv.notEqualWith !== undefined) {
                     if (rvalue === wv.notEqualWith) {
                        _match = false
                     }
                  }
                  if (wv.gt !== undefined) {
                     if (typeof rvalue === "number") {
                        if (!(rvalue > wv.gt)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  if (wv.lt !== undefined) {
                     if (typeof rvalue === "number") {
                        if (!(rvalue < wv.lt)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  if (wv.gte !== undefined) {
                     if (typeof rvalue === "number") {
                        if (!(rvalue >= wv.gte)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  if (wv.lte !== undefined) {
                     if (typeof rvalue === "number") {
                        if (!(rvalue <= wv.lte)) {
                           _match = false
                        }
                     } else {
                        _match = false
                     }
                  }
                  continue
               }

               if (wv !== rvalue) {
                  _match = false
                  break
               }
            }
            return _match
         })

         if (match) {
            rows.push(row)
         }
      }
      return rows
   }

   findOne(args: FindArgs<RS>): MakeRowType<RS> | null {
      const rows = this.find(args)
      return rows.length > 0 ? rows[0] : null
   }

   getIndex(args: FindArgs<RS>): number {
      const row = this.findOne(args)
      if (row) {
         return this._rows.findIndex(r => r.rid === row.rid)
      }
      return -1
   }

   move(args: MoveArgs<RS>): boolean {
      const { fromIndex, toIndex, disablelObservation, observeId } = args
      if (fromIndex < 0 || toIndex < 0) return false
      const [movedRow] = this._rows.splice(fromIndex, 1)
      this._rows.splice(toIndex, 0, movedRow)
      if (!disablelObservation) {
         this.dispatch(observeId)
      }
      return true
   }

   // Meta Methods
   setMeta<T extends keyof Infer<MS>>(key: T, value: Infer<MS>[T], observe = true) {
      this._meta.set(key, this._meta_schema ? (this._meta_schema as any)[key].parse(value) : value)
      observe && this.dispatch()
   }

   getMeta<T extends keyof Infer<MS>>(key: T, observe = true): Infer<MS>[T] | undefined {
      observe && this.observe()
      return this._meta.get(key) as Infer<MS>[T] | undefined
   }

   deleteMeta<T extends keyof Infer<MS>>(key: T, observe = true) {
      this._meta.delete(key)
      observe && this.dispatch()
   }

   clearMeta(observe = true) {
      this._meta.clear()
      observe && this.dispatch()
   }
}

export default Store