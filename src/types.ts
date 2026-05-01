import { Infer, XVAny, XVArray, XVBoolean, XVDate, XVEnum, XVFile, XVFunction, XVMap, XVNumber, XVObject, XVPromise, XVRecord, XVSet, XVString, XVTuple, XVType, XVUnion } from "xanv";

type XVInstanceType =
   | XVAny
   | XVArray<any>
   | XVBoolean
   | XVDate
   | XVEnum<any>
   | XVFile
   | XVFunction<any, any>
   | XVMap
   | XVNumber
   | XVObject<any>
   | XVPromise<any>
   | XVRecord<any, any>
   | XVSet
   | XVString
   | XVTuple
   | XVType<any>
   | XVUnion


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



export type FindArgs<RS> = {
   where: WhereType<RS>;
   observeId?: string;
   disablelObservation?: boolean
}

export type DeleteArgs<RS> = {
   where: WhereType<RS>;
   observeId?: string;
   disablelObservation?: boolean
}

export type UpdateArgs<RS> = {
   data: Partial<MakeRowType<RS>>;
   where: WhereType<RS>;
   observeId?: string;
   disablelObservation?: boolean
}

export type CreateArgs<RS> = {
   data: Partial<MakeRowType<RS>>
   observeId?: string;
   disablelObservation?: boolean
}

export type CreateManyArgs<RS> = {
   data: Partial<MakeRowType<RS>>[]
   observeId?: string;
   disablelObservation?: boolean
}

export type MoveArgs<RS> = {
   fromIndex: number,
   toIndex: number;
   observeId?: string;
   disablelObservation?: boolean
}