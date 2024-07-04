import { FinderArgsType, QueryType } from "./Finder";

export type RowPredefinedFields = {
    _id: string;
    _index: number;
    _observe: number;
}

export type RowType<Row> = Row & RowPredefinedFields
export type WhereType<Row> = QueryType<RowType<Row>>
export type ArgsType<Row> = FinderArgsType<RowType<Row>>