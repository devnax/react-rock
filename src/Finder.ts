import { FinderArgsType, QueryType, QueryValueType } from "./types"

export const isOb = (ob: any) => typeof ob === "object" && !Array.isArray(ob) && ob !== null
const isNum = (n: any) => typeof n === 'number'
const excuteQuery: any = {
    contain: (v: any, qv: any) => typeof v === 'string' && v.search(qv) !== -1,
    startWith: (v: any, qv: any) => typeof v === 'string' && v.startsWith(qv),
    endWith: (v: any, qv: any) => typeof v === 'string' && v.endsWith(qv),
    lt: (v: any, qv: any) => isNum(v) && v < qv,
    gt: (v: any, qv: any) => isNum(v) && v > qv,
    lte: (v: any, qv: any) => isNum(v) && v <= qv,
    gte: (v: any, qv: any) => isNum(v) && v >= qv,
}

const isInQuery = <Row>(rowVal: Row, queryObject: QueryValueType) => {
    let match = true
    for (let queryKey in queryObject) {
        let qVal = (queryObject as any)[queryKey]
        const qcb = excuteQuery[queryKey]
        if (qcb && !qcb(rowVal, qVal)) {
            match = false;
            break;
        }
    }
    return match
}

const Finder = <Row extends object>(rows: Row[], query: null | QueryType<Row>, args?: FinderArgsType<Row>) => {
    let result: Row[] = []
    let indexes: number[] = []
    let ids: string[] = []

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i]
        let found = false;
        if (isOb(query)) {
            for (let rowKey in query) {
                let queryVal = query[rowKey]
                if (!(rowKey in row)) break;

                if (isOb(queryVal)) {
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
        } else {
            found = true
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
            ids.push((row as any)._id)
        }
    }

    const take = args?.take || result.length
    const skip = args?.skip || 0

    if (args?.take && args?.skip) {
        result = result.splice(skip, take)
    } else if (!args?.skip && args?.take) {
        result.splice(args.take)
    } else if (!args?.take && args?.skip) {
        result = result.splice(args.skip)
    }

    return { rows: result, indexes, ids }
}

export default Finder