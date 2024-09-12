export type StateDataType = "state" | "meta"

export type RowPredefinedFields = {
    _id: string;
    _index: number;
    _observe: number;
}

export type RowType<Row> = Row & RowPredefinedFields
export type WhereType<Row> = QueryType<RowType<Row>>
export type ArgsType<Row> = FinderArgsType<RowType<Row>>


export interface IStateHandler<Row, MetaProps> {
    create(row: Row): RowType<Row>;
    createMany(rows: Row[]): void;
    update(row: Partial<Row>, where: WhereType<Row>, args?: ArgsType<Row>): void;
    updateAll(row: Partial<Row>): void;
    delete(where: WhereType<Row>, args?: ArgsType<Row>): void;
    clearAll(): void;
    getAll(args?: ArgsType<Row>): RowType<Row>[];
    find(where: WhereType<Row>, args?: ArgsType<Row>): RowType<Row>[];
    findFirst(where: WhereType<Row>): RowType<Row>;
    findById(_id: string): RowType<Row>;
    move(oldIdx: number, newIdx: number): void;
    setMeta<T extends keyof MetaProps>(key: T, value: MetaProps[T]): void;
    getMeta<T extends keyof MetaProps>(key: T, def?: any): MetaProps[T];
    getAllMeta(): MetaProps;
    deleteMeta<T extends keyof MetaProps>(key: T): void;
    clearMeta(): void;
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

export type FinderArgsType<Row> = {
    getRow?: (row: Row, index: number) => Row | void;
    skip?: number;
    take?: number;
    noDispatch?: boolean;
}