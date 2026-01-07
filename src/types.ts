import { Infer, XVInstanceType } from "xanv";

export type RowSchema = {
   [key: string]: XVInstanceType
}

export type MetaSchema = {
   [key: string]: XVInstanceType
}

export type StoreRID = number
export type StoreVID = number

export type MakeRowType<RS> = Infer<RS> & {
   rid: StoreRID
   vid: StoreVID
}

export type MakeMetaType<MS> = Infer<MS>

export type RowValueType = string | number | boolean | null | undefined;

export type QueryValueType = {
   contain?: RowValueType;
   startWith?: string | number;
   endWith?: string | number;
   equalWith?: RowValueType;
   notEqualWith?: RowValueType;
   gt?: number;
   lt?: number;
   gte?: number;
   lte?: number;
}

export type WhereType<RS> = {
   [key in keyof MakeRowType<RS>]?: RowValueType | QueryValueType
}
