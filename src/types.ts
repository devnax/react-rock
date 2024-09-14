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
    detect?: boolean;
}

export type RowType<Row> = Row & RowPredefinedFields
export type WhereType<Row> = QueryType<RowType<Row>>
export type ArgsType<Row> = FinderArgsType<RowType<Row>>
export type GetRowCallback<Row> = (row: Row, index: number) => Row | void;

export interface IStateHandler<Row, MetaProps> {
    create(row: Row, dispatch?: boolean): RowType<Row>;
    createMany(rows: Row[], dispatch?: boolean): void;
    update(row: Partial<Row>, where: WhereType<Row>, dispatch?: boolean): void;
    updateAll(row: Partial<Row>, dispatch?: boolean): void;
    delete(where: WhereType<Row>, dispatch?: boolean): void;
    clearAll(dispatch?: boolean): void;
    move(oldIdx: number, newIdx: number, dispatch?: boolean): void;

    getAll(args?: { detect?: boolean; getRow?: GetRowCallback<Row> }): RowType<Row>[];
    find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[];
    findFirst(where: WhereType<Row>, detect?: boolean): RowType<Row>;
    findById(_id: string, detect?: boolean): RowType<Row>;

    setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T], dispatch?: boolean): void;
    getMeta<T extends keyof MetaProps>(key: T, detect?: boolean): MetaProps[T];
    getAllMeta(detect?: boolean): MetaProps;
    deleteMeta<T extends keyof MetaProps>(key: T, dispatch?: boolean): void;
    clearMeta(dispatch?: boolean): void;
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