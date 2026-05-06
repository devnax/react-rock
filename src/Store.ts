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
         const id = observeId ?? hid
         const [, dispatch] = ustate(0)
         ueffect(() => {
            this._hooks.set(id, () => dispatch(Math.random()))
            return () => {
               this._hooks.delete(id)
            }
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

   rows(disableObservation = false) {
      if (!disableObservation) {
         this.observe();
      }
      return this._rows
   }

   metas(disableObservation = false) {
      if (!disableObservation) {
         this.observe();
      }
      return this._meta
   }

   createMany(args: CreateManyArgs<RS>): MakeRowType<RS>[] {
      const { data, disableObservation, observeId } = args
      const res = []
      for (let row of data) {
         const created = this.create({
            data: row,
            disableObservation: true
         })
         res.push(created)
      }
      if (!disableObservation) {
         this.dispatch(observeId)
      }
      return res
   }
   // Row Methods
   create(args: CreateArgs<RS>): MakeRowType<RS> {
      const { data, disableObservation, observeId } = args
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
      if (!disableObservation) {
         this.dispatch(observeId)
      }
      return _row
   }

   // update
   update(args: UpdateArgs<RS>): MakeRowType<RS>[] | null {
      const { data, where, disableObservation, observeId } = args
      // validate row
      let r: any = {} as MakeRowType<RS>
      for (let key in data) {
         if (key === "rid" || key === 'vid') continue;
         const schema = this._row_schema[key]
         r[key] = schema.parse(data[key])
      }

      const rows = this.find({ disableObservation: true, where })
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
         if (!disableObservation) {
            this.dispatch(observeId)
         }
      }
      return this.find({ where, disableObservation: true })
   }

   // delete
   delete(args: DeleteArgs<RS>): number {
      const { where, disableObservation, observeId } = args
      const rows = this.find({
         where,
         disableObservation: true
      })

      let deletedCount = 0
      if (rows.length > 0) {
         this._rows = this._rows.filter(r => !rows.find(dr => dr.rid === r.rid))
         deletedCount = rows.length
         if (!disableObservation) {
            this.dispatch(observeId)
         }
      }
      return deletedCount
   }

   // find
   find(args: FindArgs<RS>): MakeRowType<RS>[] {
      const { where, disableObservation, observeId } = args;

      if (!disableObservation) {
         this.observe(observeId);
      }

      const rows: MakeRowType<RS>[] = [];

      for (const row of this._rows) {
         let match = true;

         for (const wcol in where) {
            const condition = where[wcol];
            const rvalue = row[wcol];

            if (typeof condition === "object" && condition !== null) {

               if (condition.contain !== undefined) {
                  if (typeof rvalue !== "string" || !rvalue.includes(condition.contain as any)) {
                     match = false;
                     break;
                  }
               }

               if (condition.startWith !== undefined) {
                  if (typeof rvalue !== "string" || !rvalue.startsWith(condition.startWith as any)) {
                     match = false;
                     break;
                  }
               }

               if (condition.endWith !== undefined) {
                  if (typeof rvalue !== "string" || !rvalue.endsWith(condition.endWith as any)) {
                     match = false;
                     break;
                  }
               }

               if (condition.equalWith !== undefined && rvalue !== condition.equalWith) {
                  match = false;
                  break;
               }

               if (condition.notEqualWith !== undefined && rvalue === condition.notEqualWith) {
                  match = false;
                  break;
               }

               if (condition.gt !== undefined) {
                  if (typeof rvalue !== "number" || !(rvalue > condition.gt)) {
                     match = false;
                     break;
                  }
               }

               if (condition.lt !== undefined) {
                  if (typeof rvalue !== "number" || !(rvalue < condition.lt)) {
                     match = false;
                     break;
                  }
               }

               if (condition.gte !== undefined) {
                  if (typeof rvalue !== "number" || !(rvalue >= condition.gte)) {
                     match = false;
                     break;
                  }
               }

               if (condition.lte !== undefined) {
                  if (typeof rvalue !== "number" || !(rvalue <= condition.lte)) {
                     match = false;
                     break;
                  }
               }

            } else {
               if (condition !== rvalue) {
                  match = false;
                  break;
               }
            }
         }

         if (match) {
            rows.push(row);
         }
      }

      return rows;
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
      const { fromIndex, toIndex, disableObservation, observeId } = args
      if (fromIndex < 0 || toIndex < 0) return false
      const [movedRow] = this._rows.splice(fromIndex, 1)
      this._rows.splice(toIndex, 0, movedRow)
      if (!disableObservation) {
         this.dispatch(observeId)
      }
      return true
   }

   setMeta<T extends keyof Infer<MS>>(key: T, value: Infer<MS>[T], disableObservation = false) {
      this._meta.set(key, this._meta_schema ? (this._meta_schema as any)[key].parse(value) : value)
      if (!disableObservation) {
         this.dispatch()
      }
   }

   getMeta<T extends keyof Infer<MS>>(key: T, disableObservation = false): Infer<MS>[T] | undefined {
      if (!disableObservation) {
         this.observe();
      }
      return this._meta.get(key) as Infer<MS>[T] | undefined
   }

   deleteMeta<T extends keyof Infer<MS>>(key: T, disableObservation = false) {
      this._meta.delete(key)
      if (!disableObservation) {
         this.dispatch()
      }
   }

   clearMeta(disableObservation = false) {
      this._meta.clear()
      if (!disableObservation) {
         this.dispatch()
      }
   }
}

export default Store