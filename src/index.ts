"use client"
import Store from "./Store"
import { MetaSchema, RowSchema } from "./types"

const createStore = <RS extends RowSchema, MS extends MetaSchema | undefined = undefined>(rowSchema: RS, metaSchema?: MS) => {
    return new Store(rowSchema, metaSchema)
}

export default createStore