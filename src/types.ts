export type StateDataType = "state" | "meta"

export type RowPredefinedFields = {
    _id: string;
    _index: number;
    _observe: number;
}

export type FinderArgsType<Row> = {
    getRow?: (row: Row, index: number) => Row | void;
    skip?: number;
    take?: number;
    freeze?: boolean;
}

export type RowType<Row> = Row & RowPredefinedFields
export type WhereType<Row> = QueryType<RowType<Row>>
export type ArgsType<Row> = FinderArgsType<RowType<Row>>
export type GetRowCallback<Row> = (row: Row, index: number) => Row | void;

export interface IStateHandler<Row, MetaProps> {
    create(row: Row, freeze?: boolean): RowType<Row>;
    createMany(rows: Row[], freeze?: boolean): void;
    update(row: Partial<Row>, where: WhereType<Row>, freeze?: boolean): void;
    updateAll(row: Partial<Row>, freeze?: boolean): void;
    delete(where: WhereType<Row>, freeze?: boolean): void;
    clearAll(freeze?: boolean): void;
    move(oldIdx: number, newIdx: number, freeze?: boolean): void;

    getAll(args?: { freeze?: boolean; getRow?: GetRowCallback<Row> }): RowType<Row>[];
    find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[];
    findFirst(where: WhereType<Row>, freeze?: boolean): RowType<Row>;
    findById(_id: string, freeze?: boolean): RowType<Row>;

    setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T], freeze?: boolean): void;
    getMeta<T extends keyof MetaProps>(key: T, freeze?: boolean): MetaProps[T];
    getAllMeta(freeze?: boolean): MetaProps;
    deleteMeta<T extends keyof MetaProps>(key: T, freeze?: boolean): void;
    clearMeta(freeze?: boolean): void;
}


export type QueryValueType = {
    contain?: string | number;
    startWith?: string | number;
    endWith?: string | number;
    gt?: number;
    lt?: number;
    gte?: number;
    lte?: number;
}

export type QueryType<Row = {}> = {
    [key in keyof Row]?: string | number | null | undefined | QueryValueType
}