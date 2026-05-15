"use client";
import { useEffect, useId, useState } from "react";
import {
  CreateArgs,
  CreateManyArgs,
  DeleteArgs,
  FindArgs,
  Hooks,
  MakeMetaType,
  MakeRowType,
  MetaSchema,
  MoveArgs,
  RowSchema,
  UpdateArgs,
  WhereType,
} from "./types";
import { Infer, xv } from "xanv";

const uid = useId as any;
const ustate = useState as any;
const ueffect = useEffect as any;

class Store<
  RS extends RowSchema,
  MS extends MetaSchema | undefined = undefined,
> {
  // private _rows: MakeRowType<RS>[] = [];
  private _rows = new Map<number, MakeRowType<RS>>();
  private _meta: Map<
    keyof MakeMetaType<MS>,
    MakeMetaType<MS>[keyof MakeMetaType<MS>]
  > = new Map();
  private _hooks: Hooks = new Map();
  private _pending_hook_uids: string[] = [];
  private _row_schema: RS;
  private _meta_schema?: MS;
  private _last_id = 0;

  constructor(rowSchema: RS, metaSchema?: MS) {
    this._row_schema = {
      ...rowSchema,
      rid: xv.number(),
      vid: xv
        .number()
        .default(() =>
          Math.round((Math.random() + Math.random()) * 9999999999),
        ),
    };
    this._meta_schema = metaSchema;
  }

  observe = (observeId: string = "default") => {
    try {
      const _uid = uid();
      const [, dispatch] = ustate(0);
      ueffect(() => {
        const factory = this._hooks.get(observeId) || new Map();
        factory.set(_uid, () => dispatch(Math.random()));
        this._hooks.set(observeId, factory);
        return () => {
          factory.delete(_uid);
          if (factory.size) {
            this._hooks.set(observeId, factory);
          } else {
            this._hooks.delete(observeId);
          }
        };
      }, []);
      return _uid;
    } catch (error) {}
  };

  dispatch(
    observeIdOrCallback?: string | ((cb: Function, key: string) => void),
  ) {
    if (typeof observeIdOrCallback === "string") {
      const factory = this._hooks.get(observeIdOrCallback);
      factory?.forEach((cb, _uid) => {
        try {
          cb();
        } catch (_err) {
          factory.delete(_uid);
          this._hooks.set(observeIdOrCallback, factory);
        }
      });
    } else {
      this._hooks.forEach((factory, key) => {
        factory?.forEach((cb, _uid) => {
          try {
            if (typeof observeIdOrCallback === "function") {
              observeIdOrCallback(cb, key);
            } else {
              cb();
            }
          } catch (_err) {
            factory.delete(_uid);
            this._hooks.set(key, factory);
          }
        });
      });
    }

    if (this._pending_hook_uids.length) {
      this._hooks.forEach((factory, key) => {
        factory?.forEach((cb, _uid) => {
          try {
            cb();
          } catch (_err) {
            factory.delete(_uid);
            this._hooks.set(key, factory);
          }
        });
      });
    }
  }

  rows(disableObservation = false) {
    if (!disableObservation) {
      this.observe();
    }
    return this._rows;
  }

  metas(disableObservation = false) {
    if (!disableObservation) {
      this.observe();
    }
    return this._meta;
  }

  createMany(args: CreateManyArgs<RS>): MakeRowType<RS>[] {
    const { data, disableObservation, observeId } = args;
    const res = [];
    for (let row of data) {
      const created = this.create({
        data: row,
        disableObservation: true,
      });
      res.push(created);
    }
    if (!disableObservation) {
      this.dispatch(observeId);
    }
    return res;
  }
  // Row Methods
  create(args: CreateArgs<RS>): MakeRowType<RS> {
    const { data, disableObservation, observeId } = args;
    // validate and create row
    let r: any = {} as MakeRowType<RS>;
    for (let key in this._row_schema) {
      if (key === "rid" || key === "vid") continue;
      const schema = this._row_schema[key];
      r[key] = schema.parse(data[key]);
    }

    this._last_id = this._last_id + 1;
    const _row: MakeRowType<RS> = {
      ...r,
      rid: this._last_id,
      vid: this._row_schema.vid.parse(undefined),
    };

    this._rows.set(_row.rid, _row);
    if (!disableObservation) {
      this.dispatch(observeId);
    }
    return _row;
  }

  // update
  update(args: UpdateArgs<RS>): MakeRowType<RS>[] | null {
    const { data, where, disableObservation, observeId } = args;
    // validate row
    let r: any = {} as MakeRowType<RS>;
    for (let key in data) {
      if (key === "rid" || key === "vid") continue;
      const schema = this._row_schema[key];
      r[key] = schema.parse(data[key]);
    }

    const rows = this.find({ disableObservation: true, where });
    if (rows.length > 0) {
      for (let index = 0; index < rows.length; index++) {
        const _row = rows[index];
        const rid = _row.rid;
        this._rows.set(rid, {
          ..._row,
          ...r,
          rid,
          vid: this._row_schema.vid.parse(undefined),
        });
      }
      if (!disableObservation) {
        this.dispatch(observeId);
      }
    }
    return this.find({ where, disableObservation: true });
  }

  // delete
  delete(args: DeleteArgs<RS>): number {
    const { where, disableObservation, observeId } = args;
    const rows = this.find({
      where,
      disableObservation: true,
    });

    let deletedCount = rows.length;
    if (rows.length > 0) {
      for (let row of rows) {
        this._rows.delete(row.rid);
      }
      if (!disableObservation) {
        this.dispatch(observeId);
      }
    }
    return deletedCount;
  }

  // find
  find(args: FindArgs<RS>): MakeRowType<RS>[] {
    const { where, disableObservation, observeId } = args;
    let _uid;
    if (!disableObservation) {
      _uid = this.observe(observeId);
    }

    const rows: MakeRowType<RS>[] = [];

    for (const row of Array.from(this._rows.values())) {
      let match = true;

      for (const wcol in where) {
        const condition = where[wcol];
        const rvalue = row[wcol];

        if (typeof condition === "object" && condition !== null) {
          if (condition.contain !== undefined) {
            if (
              typeof rvalue !== "string" ||
              !rvalue.includes(condition.contain as any)
            ) {
              match = false;
              break;
            }
          }

          if (condition.startWith !== undefined) {
            if (
              typeof rvalue !== "string" ||
              !rvalue.startsWith(condition.startWith as any)
            ) {
              match = false;
              break;
            }
          }

          if (condition.endWith !== undefined) {
            if (
              typeof rvalue !== "string" ||
              !rvalue.endsWith(condition.endWith as any)
            ) {
              match = false;
              break;
            }
          }

          if (
            condition.equalWith !== undefined &&
            rvalue !== condition.equalWith
          ) {
            match = false;
            break;
          }

          if (
            condition.notEqualWith !== undefined &&
            rvalue === condition.notEqualWith
          ) {
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

    if (_uid && !rows.length) {
      this._pending_hook_uids.push(_uid);
    } else if (this._pending_hook_uids.includes(_uid)) {
      const index = this._pending_hook_uids.indexOf(_uid);
      this._pending_hook_uids.splice(index, 1);
    }

    return rows;
  }

  findOne(args: FindArgs<RS>): MakeRowType<RS> | null {
    const rows = this.find(args);
    return rows.length > 0 ? rows[0] : null;
  }

  findById(rid: number, disableObservation = false) {
    let _uid;
    if (!disableObservation) {
      _uid = this.observe(rid.toString());
    }
    const row = this._rows.get(rid);
    if (_uid && !row) {
      this._pending_hook_uids.push(_uid);
    } else if (this._pending_hook_uids.includes(_uid)) {
      const index = this._pending_hook_uids.indexOf(_uid);
      this._pending_hook_uids.splice(index, 1);
    }
    return row;
  }

  getIndex(args: FindArgs<RS>): number {
    const row = this.findOne(args);
    if (row) {
      const keys = Array.from(this._rows.keys());
      return keys.indexOf(row.rid);
    }
    return -1;
  }

  move(args: MoveArgs<RS>): boolean {
    const { fromIndex, toIndex, disableObservation, observeId } = args;
    if (fromIndex < 0 || toIndex < 0) return false;
    const entries = [...Array.from(this._rows.entries())];
    if (fromIndex >= entries.length || toIndex >= entries.length) {
      return false;
    }

    const [movedItem] = entries.splice(fromIndex, 1);

    entries.splice(toIndex, 0, movedItem);

    this._rows = new Map(entries);

    if (!disableObservation) {
      this.dispatch(observeId);
    }

    return true;
  }

  setMeta<T extends keyof Infer<MS>>(
    key: T,
    value: Infer<MS>[T],
    disableObservation = false,
  ) {
    this._meta.set(
      key,
      this._meta_schema ? (this._meta_schema as any)[key].parse(value) : value,
    );
    if (!disableObservation) {
      this.dispatch();
    }
  }

  getMeta<T extends keyof Infer<MS>>(
    key: T,
    disableObservation = false,
  ): Infer<MS>[T] | undefined {
    if (!disableObservation) {
      this.observe();
    }
    return this._meta.get(key) as Infer<MS>[T] | undefined;
  }

  deleteMeta<T extends keyof Infer<MS>>(key: T, disableObservation = false) {
    this._meta.delete(key);
    if (!disableObservation) {
      this.dispatch();
    }
  }

  clearMeta(disableObservation = false) {
    this._meta.clear();
    if (!disableObservation) {
      this.dispatch();
    }
  }
}

export default Store;
