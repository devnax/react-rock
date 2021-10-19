import { is_array, is_callable, is_number, is_object, is_string, uid } from "../utils";
import MetaData from './MetaData'

export default class DataRow extends MetaData{

    /**
     * 
     * @param {Object} row {
     * @returns Object 
     */
    formateRow(row){
        let observe = {}
        let _id   = uid()
        if(row.observe){
            _id = row._id
            const prev_observe = row.observe()
            observe = {...prev_observe, updated: Date.now()}
        }else{
            observe = {created: Date.now(), updated: Date.now()}

        }


        return {...row, _id, observe: () => observe}
    }


    insert(tb, row){
        if(!this.hasTable(tb) || !is_object(row)) return;
        row = this.formateRow(row)
        this.state.data[tb].rows.push(row)
        this.onUpdateState(tb)
        return row
    }

    insertAfter(tb, row, index){
        if(!this.hasTable(tb) || !is_object(row)) return;
        row = this.formateRow(row)
        if(!isNaN(index) && typeof index === 'number'){
            this.state.data[tb].rows.splice(parseInt(index), 0, row);
        }else{
            this.state.data[tb].rows.push(row)
        }
        this.onUpdateState(tb)
        return row
    }


    insertMany(tb, rows){
        if(!this.hasTable(tb) || !is_array(rows)) return;
        const _rows = []
        for(let row in rows){
            row = this.formateRow(row)
            this.state.data[tb].rows.push(row)
            _rows.push(row)
        }
        this.onUpdateState(tb)
        return _rows
    }

    update(tb, row, where, cb = null){
        this.query(tb, where, (prevRow) => {
            if(is_callable(cb)){
                prevRow = cb(prevRow)
            }
            const fRow = this.formateRow(prevRow) // just Update the row info
            return {...fRow, ...row, _id: fRow._id}
        })
        this.onUpdateState(tb)
    }

    updateAll(tb, row, cb = null){
        this.query(tb, '@', (prevRow) => {
            if(is_callable(cb)){
                prevRow = cb(prevRow)
            }
            const fRow = this.formateRow(prevRow) // just Update the row info
            
            return {...fRow, ...row, _id: fRow._id}
        })
        this.onUpdateState(tb)
    }

    move(tb, oldIdx, newIdx){
        if(!this.hasTable(tb)) return;
        if(!isNaN(oldIdx) && !isNaN(newIdx) && typeof oldIdx === 'number' && typeof newIdx === 'number'){
            const row = this.state.data[tb].rows[oldIdx]
            if(row){
                this.state.data[tb].rows.splice(oldIdx, 1);
                this.state.data[tb].rows.splice(newIdx, 0, row);
                this.onUpdateState(tb)
            }
        }
    }


    count(tb){
        if(!this.hasTable(tb)) return;
        return this.state.data[tb].rows.length
    }


    delete(tb, where){
        this.query(tb, where, () => null)
        this.state.data[tb].rows = this.query(tb, '@')
        this.onUpdateState(tb)
    }

    get(tb, where){
        if(!where){
            return
        }
        const data = this.query(tb, where)
        
        if(data.length && is_number(where)){
            return data[0]
        }else if(data.length && is_string(where) && where.charAt(0) != '@'){
           return data[0]
        }
        return data.length ? data : false
    }

    getIndex(tb, id){
        if(!id) return;
        const data = this.queryNodes(tb, id)
        if(data && data.length){
            return data[0].path[1]
        }
    }

    getAll(tb){
        return this.query(tb, '@')
    }

    
}