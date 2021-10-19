import { is_object, is_array } from "../utils"

export default class MetaData{
    
    addMeta(key, data){
        this.state.meta_data[key] = this.formateRow({meta_value: data})
        this.onUpdateState()
    }

    addMetas(metas){
        if(!is_object(metas)){
            return;
        }
        for(let key in metas){
            const data = metas[key]
            this.state.meta_data[key] = this.formateRow({meta_value: data})
        }
        this.onUpdateState()
    }


    getMeta(key, def){
        const meta = this.state.meta_data[key]
        if(meta){
            return meta.meta_value
        }
        return def
    }

    getMetas(keys, def){
        if(!is_array(keys)){
            return
        }
        const metas = {}
        for(let key of keys){
            metas[key] = this.state.meta_data[key] || def
        }
        return metas
    }

    getAllMeta(){
        return this.state.meta_data
    }

    getMetaInfo(key){
        const meta = this.state.meta_data[key]
        if(meta){
            return meta
        }
    }
    
    observeMeta(key){
        const meta = this.state.meta_data[key]
        if(meta){
            return meta.observe
        }
        const row = this.formateRow({meta_value: ''})
        return row.observe
    }

    deleteMeta(key){
        delete this.state.meta_data[key]
        this.onUpdateState()
    }

    deleteMetas(keys){
        for(let key of keys){
            delete this.state.meta_data[key]
        }
        this.onUpdateState()
    }

    deleteAllMeta(){
        this.state.meta_data = {}
    }
}