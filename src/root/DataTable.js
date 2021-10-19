import DataRow from "./DataRow";
import { is_callable, is_number, is_object, is_string } from "../utils";
import jpath from 'jsonpath'

export default class DataTable extends DataRow{

    queryExpression(ex){
        let _q
        if(is_number(ex)){
            _q = `$[${ex}]` // with index
        }else if(is_string(ex)){
            if(ex.charAt(0) == '@'){
                _q = `$[?(${ex})]`
            }else{
                _q = `$[?(@._id=='${ex}')]`
            }
        }else if(is_object(ex)){
            let _and = ""
            let fex = ''// formate
            for(let k in ex){
                let v = ex[k]
                if(is_string(ex[k])){
                    v = `'${ex[k]}'`
                }
                fex += `${_and}@.${k}==${v}`
                _and = '&&'
            }
            _q = `$[?(${fex})]`
        }else{
            _q = `$[?(@)]`
        }
        return _q
    }

    query(tb, jpQuery, cb = null){
        try{
            if(is_callable(cb)){
                return jpath.apply(
                    this.state.data[tb].rows, 
                    this.queryExpression(jpQuery),
                cb)
            }
            return jpath.query(
                this.state.data[tb].rows,
                this.queryExpression(jpQuery)
            )
        }catch(err){
            console.error("PARSE ERROR")
        }
        
    }

    queryNodes(tb, jpQuery){
        try{
            return jpath.nodes(
                this.state.data[tb].rows, 
                this.queryExpression(jpQuery)
            )
        }catch(err){
            console.error("PARSE ERROR")
        }
        
    }


    updateTableInfo(tb){
        if(!this.hasTable(tb)) return;
        this.state.data[tb].info.updated = Date.now()
        this.state.data[tb].info.length = Object.keys(this.state.data[tb].rows).length
    }

    /**
     * creating the table to the state
     * @param {string} tb table name
     */
    createTable(tb){
        this.state.data[tb] = {
            info: {
                created: Date.now(),
                updated: Date.now()
            },
            rows: []
        }
    }

    hasTable(tb){
        return this.state.data[tb] ? true : false;
    }

    dropTable(tb){
        delete this.state.data[tb]
    }

    tableInfo(tb){
        return this.state.data[tb].info
    }

    observeTable(tb){
        return this.state.data[tb].info.updated
    }
}