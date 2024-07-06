

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
}


const isInQuery = <Row>(rowVlaue: Row, queryObject: QueryValueType) => {
    let match = true
    for (let queryKey in queryObject) {
        let queryVal = (queryObject as any)[queryKey]

        switch (queryKey) {
            case "contain":
                if (!(typeof rowVlaue === 'string' && rowVlaue.search(queryVal) !== -1)) {
                    match = false;
                    break;
                }
                break;
            case "startWith":
                if (!(typeof rowVlaue === 'string' && rowVlaue.startsWith(queryVal))) {
                    match = false;
                    break;
                }
                break;
            case "endWith":
                if (!(typeof rowVlaue === 'string' && rowVlaue.endsWith(queryVal))) {
                    match = false;
                    break;
                }
                break;
            case "lt":
                if (!(typeof rowVlaue === 'number' && rowVlaue < queryVal)) {
                    match = false;
                    break;
                }
                break;
            case "gt":
                if (!(typeof rowVlaue === 'number' && rowVlaue > queryVal)) {
                    match = false;
                    break;
                }
                break;
            case "lte":
                if (!(typeof rowVlaue === 'number' && rowVlaue <= queryVal)) {
                    match = false;
                    break;
                }
                break;
            case "gte":
                if (!(typeof rowVlaue === 'number' && rowVlaue >= queryVal)) {
                    match = false;
                    break;
                }
                break;
        }
    }

    return match
}

const Finder = <Row extends object>(rows: Row[], query: QueryType<Row>, args?: FinderArgsType<Row>) => {
    let result: Row[] = []
    let indexes: number[] = []

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i]
        let found = false;

        for (let rowKey in query) {
            let queryVal = query[rowKey]
            if (!(rowKey in row)) break;

            if (typeof queryVal === "object" && !Array.isArray(queryVal) && queryVal !== null) {
                if (isInQuery(row[rowKey], queryVal as any)) {
                    found = true
                } else {
                    found = false
                    break;
                }
            } else if (row[rowKey] === queryVal) {
                found = true;
            } else {
                found = false
                break;
            }
        }

        if (found) {
            if (args?.getRow) {
                let r = args.getRow({ ...row }, i)
                if (r) {
                    row = r
                } else {
                    continue;
                }
            }
            result.push({ ...row, _index: i })
            indexes.push(i)
        }
    }

    return { rows: result, indexes }
}

export default Finder