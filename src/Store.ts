"use client"
import { useEffect, useId, useState } from "react"
import { MakeMetaType, MakeRowType, MetaSchema, RowSchema, WhereType } from "./types"
import { Infer, xv } from "xanv"

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

   private use = () => {
      try {
         const hid = useId()
         const [, dispatch] = useState(0)
         this._hooks.set(hid, () => dispatch(Math.random()))
         useEffect(() => () => {
            this._hooks.delete(hid)
         }, [])
      } catch (error) { }
   }

   private dispatch = () => {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
         this._hooks.forEach((cb, key) => {
            try {
               cb()
            } catch (_err) {
               this._hooks.delete(key)
            }
         })
      }, 0)
   }

   rows(use = true) {
      use && this.use()
      return this._rows
   }

   metas(use = true) {
      use && this.use()
      return this._meta
   }

   // Row Methods
   create(row: Partial<MakeRowType<RS>>, dispatch?: boolean): MakeRowType<RS>
   create(row: Partial<MakeRowType<RS>>[], dispatch?: boolean): MakeRowType<RS>[]
   create(row: Partial<MakeRowType<RS>> | Partial<MakeRowType<RS>>[], dispatch = true): MakeRowType<RS> | MakeRowType<RS>[] {
      if (Array.isArray(row)) {
         const rows: MakeRowType<RS>[] = []
         for (const r of row) {
            rows.push(this.create(r, false))
         }
         dispatch && this.dispatch()
         return rows
      }

      // validate and create row
      let r: any = {} as MakeRowType<RS>
      for (let key in this._row_schema) {
         if (key === "rid" || key === "vid") continue;
         const schema = this._row_schema[key]
         r[key] = schema.parse(row[key])
      }

      this._last_id = this._last_id + 1;
      const _row: MakeRowType<RS> = {
         ...r,
         rid: this._last_id,
         vid: this._row_schema.vid.parse(undefined),
      }

      this._rows.push(_row)
      dispatch && this.dispatch()
      return _row
   }


   // update
   update(row: Partial<MakeRowType<RS>>, where?: WhereType<RS> | null, dispatch = true): MakeRowType<RS>[] | null {

      // validate row
      let r: any = {} as MakeRowType<RS>
      for (let key in row) {
         if (key === "rid" || key === 'vid') continue;
         const schema = this._row_schema[key]
         r[key] = schema.parse(row[key])
      }

      const rows = this.find(where)
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
         dispatch && this.dispatch()
      }
      return this.find(where)
   }

   // delete
   delete(where?: WhereType<RS> | null, dispatch = true): number {
      const rows = this.find(where, false)

      let deletedCount = 0
      if (rows.length > 0) {
         this._rows = this._rows.filter(r => !rows.find(dr => dr.rid === r.rid))
         deletedCount = rows.length
         dispatch && this.dispatch()
      }
      return deletedCount
   }

   // find
   find(where?: WhereType<RS> | null, use = true): MakeRowType<RS>[] {
      use && this.use()

      if (!where) {
         return this._rows
      }

      const rows: MakeRowType<RS>[] = []
      for (let key in where) {
         const wv = (where as any)[key]
         if (typeof wv === "object" && wv !== null) {
            // QueryValueType
            for (let row of this._rows) {
               let match = true
               const rvalue = (row as any)[key]
               if (wv.contain !== undefined) {
                  if (typeof rvalue === "string" && typeof wv.contain === "string") {
                     if (!rvalue.includes(wv.contain)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.startWith !== undefined) {
                  if (typeof rvalue === "string" && typeof wv.startWith === "string") {
                     if (!rvalue.startsWith(wv.startWith)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.endWith !== undefined) {
                  if (typeof rvalue === "string" && typeof wv.endWith === "string") {
                     if (!rvalue.endsWith(wv.endWith)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.equalWith !== undefined) {
                  if (rvalue !== wv.equalWith) {
                     match = false
                  }
               }
               if (wv.notEqualWith !== undefined) {
                  if (rvalue === wv.notEqualWith) {
                     match = false
                  }
               }
               if (wv.gt !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue > wv.gt)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.lt !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue < wv.lt)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.gte !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue >= wv.gte)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wv.lte !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue <= wv.lte)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (match) {
                  rows.push(row)
               }
            }
         } else {
            // RowvType
            for (let row of this._rows) {
               if ((row as any)[key] === wv) {
                  rows.push(row)
               }
            }
         }
      }
      return rows
   }

   findOne(where: WhereType<RS>, use = true): MakeRowType<RS> | null {
      const rows = this.find(where, use)
      return rows.length > 0 ? rows[0] : null
   }

   findById(rid: string, use = true): MakeRowType<RS> | null {
      return this.findOne({ rid }, use)
   }

   getIndex(where: WhereType<RS>, use = true): number {
      use && this.use()
      const row = this.findOne(where, false)
      if (row) {
         return this._rows.findIndex(r => r.rid === row.rid)
      }
      return -1
   }

   move(fromIndex: number, toIndex: number, dispatch = true): boolean {
      if (fromIndex < 0 || fromIndex >= this._rows.length) return false
      if (toIndex < 0 || toIndex >= this._rows.length) return false
      const [movedRow] = this._rows.splice(fromIndex, 1)
      this._rows.splice(toIndex, 0, movedRow)
      dispatch && this.dispatch()
      return true
   }

   // Meta Methods
   setMeta<T extends keyof Infer<MS>>(key: T, value: Infer<MS>[T], dispatch = true) {
      this._meta.set(key, this._meta_schema ? (this._meta_schema[key] as any).parse(value) : value)
      dispatch && this.dispatch()
   }

   getMeta<T extends keyof Infer<MS>>(key: T, use = true): Infer<MS>[T] | undefined {
      use && this.use()
      return this._meta.get(key) as Infer<MS>[T] | undefined
   }

   deleteMeta<T extends keyof Infer<MS>>(key: T, dispatch = true) {
      this._meta.delete(key)
      dispatch && this.dispatch()
   }

   clearMeta(dispatch = true) {
      this._meta.clear()
      dispatch && this.dispatch()
   }
}

export default Store