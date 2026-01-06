"use client"
import { useEffect, useId, useState } from "react"
import { MakeMetaType, MakeRowType, MetaSchema, RowSchema, WhereType } from "./types"
import { Infer, xv } from "xanv"

class Store<RS extends RowSchema, MS extends MetaSchema | undefined = undefined> {
   private _rows: MakeRowType<RS>[] = []
   private _meta: Map<keyof MakeMetaType<MS>, MakeMetaType<MS>[keyof MakeMetaType<MS>]> = new Map()
   private _hooks: Map<string, Function> = new Map()
   private _timer: any = null

   private _rowSchema: RS
   private _metaSchema?: MS

   constructor(rowSchema: RS, metaSchema?: MS) {
      this._rowSchema = {
         ...rowSchema,
         id: xv.number(),
         ovserve: xv.number().default(() => Date.now()),
      }
      this._metaSchema = metaSchema
   }

   private useHook = () => {
      try {
         const id = useId()
         const [, dispatch] = useState(0)
         this._hooks.set(id, () => dispatch(Math.random()))

         useEffect(() => {
            return () => {
               this._hooks.delete(id)
            }
         }, [])
         return id
      } catch (error) {

      }
   }

   readonly dispatch = () => {
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
      use && this.useHook()
      return this._rows
   }

   metas(use = true) {
      use && this.useHook()
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
      let r = {} as MakeRowType<RS>
      for (let key in this._rowSchema) {
         const schema = this._rowSchema[key]
         const value = (row as any)[key]
         if (key === "id" || key === "observe") continue;
         (r as any)[key] = schema.parse(value)
      }

      const _row: MakeRowType<RS> = {
         ...r,
         id: this._rows.length > 0
            ? this._rows[this._rows.length - 1].id + 1
            : 1,
         observe: Date.now(),
      }

      this._rows.push(_row)
      dispatch && this.dispatch()
      return _row
   }


   // update
   update(row: Partial<MakeRowType<RS>>, where?: WhereType<RS> | null, dispatch = true): MakeRowType<RS> | null {

      // validate row
      let r = {} as MakeRowType<RS>
      for (let key in this._rowSchema) {
         const schema = this._rowSchema[key]
         const value = (row as any)[key]
         if (key === "id" || key === "observe") continue;
         if (value !== undefined) {
            (r as any)[key] = schema.parse(value)
         }
      }

      const rows = this.find(where)
      if (rows.length > 0) {
         for (let index = 0; index < this._rows.length; index++) {
            const _row = rows[index];
            rows[index] = {
               ..._row,
               ...r,
               id: _row.id,
               observe: Date.now(),
            }
         }
         dispatch && this.dispatch()
      }
      return null
   }

   // delete
   delete(where?: WhereType<RS> | null, dispatch = true): number {
      const rows = this.find(where, false)

      let deletedCount = 0
      if (rows.length > 0) {
         this._rows = this._rows.filter(r => !rows.find(dr => dr.id === r.id))
         deletedCount = rows.length
         dispatch && this.dispatch()
      }
      return deletedCount
   }

   // find
   find(where?: WhereType<RS> | null, use = true): MakeRowType<RS>[] {
      use && this.useHook()

      if (!where) {
         return this._rows
      }

      const rows: MakeRowType<RS>[] = []
      for (let key in where) {
         const wvalue = (where as any)[key]
         if (typeof wvalue === "object" && wvalue !== null) {
            // QueryValueType
            for (let row of this._rows) {
               let match = true
               const rvalue = (row as any)[key]
               if (wvalue.contain !== undefined) {
                  if (typeof rvalue === "string" && typeof wvalue.contain === "string") {
                     if (!rvalue.includes(wvalue.contain)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.startWith !== undefined) {
                  if (typeof rvalue === "string" && typeof wvalue.startWith === "string") {
                     if (!rvalue.startsWith(wvalue.startWith)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.endWith !== undefined) {
                  if (typeof rvalue === "string" && typeof wvalue.endWith === "string") {
                     if (!rvalue.endsWith(wvalue.endWith)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.equalWith !== undefined) {
                  if (rvalue !== wvalue.equalWith) {
                     match = false
                  }
               }
               if (wvalue.notEqualWith !== undefined) {
                  if (rvalue === wvalue.notEqualWith) {
                     match = false
                  }
               }
               if (wvalue.gt !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue > wvalue.gt)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.lt !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue < wvalue.lt)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.gte !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue >= wvalue.gte)) {
                        match = false
                     }
                  } else {
                     match = false
                  }
               }
               if (wvalue.lte !== undefined) {
                  if (typeof rvalue === "number") {
                     if (!(rvalue <= wvalue.lte)) {
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
            // RowValueType
            for (let row of this._rows) {
               if ((row as any)[key] === wvalue) {
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

   findById(id: string, use = true): MakeRowType<RS> | null {
      return this.findOne({ id }, use)
   }

   getIndex(where: WhereType<RS>, use = true): number {
      use && this.useHook()
      const row = this.findOne(where, false)
      if (row) {
         return this._rows.findIndex(r => r.id === row.id)
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
      this._meta.set(key, value)
      dispatch && this.dispatch()
   }

   getMeta<T extends keyof Infer<MS>>(key: T, use = true): Infer<MS>[T] | undefined {
      use && this.useHook()
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