# react-rock

> Build powerful React apps that scale from hundreds to tens of thousands of records and remain fast ⚡️. react-rock is a powerfull state management lib for React. It's very simple and easy to manage your React App.

[![NPM](https://img.shields.io/npm/v/react-rock.svg)](https://www.npmjs.com/package/react-rock) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation
To use React Rock with your React app, install it as a dependency:

```bash
npm install --save react-rock
```




## Initial the store 

```jsx
import {createStore} from 'react-rock'

const config = {
  tables: ['Posts', 'Users'], // you must initial the tables first for store the data
  rawStore: false, 
  keys: {name: 'val'}, // you can read the anywhere from the store with getKey(name) function 
  methods: {} // add methods to the store then you can call the methods anywhere from the store
}


const Root = () => {
  
  return (
    <div>
        ....
    </div>
  )
}


const App = createStore(Root, config)

ReactDOM.render(<App />, document.getElementById('root'))

```






## React Rock core concept



### useStore
use the store anywhere with this function and read, write the store

```jsx
import {useStore} from 'react-rock'

// custom action handler 
const createPost = () => {
  const store = useStore()
  store.insertPosts({})
}

const Comp = () => {
  const store = useStore()
  const posts = store.getAllPosts()
  return (
    <div>
        <button onClick={() => store.insertPosts({})}>Insert from Component</button>
        <button onClick={createPost}>Insert from outside</button>
    </div>
  )
}


```



### withStore
React Rock provides a withStore function for you to read values from the React Rock store and re-read the values when the store updates.

```jsx
import {withStore} from 'react-rock'

// custom action handler 
const createPost = () => {
  const store = useStore()
  store.insertPosts({})
}

const PostList = ({store, isPostTableChange, ...ownProps}) => {
  const posts = store.getAllPosts()
  return (
    <div>
        <button onClick={() => store.insertPosts({})}>Insert from Component</button>
        <button onClick={createPost}>Insert from outside</button>
    </div>
  )
}

export default withStore(PostList, ({store, ...ownProps}) => {
  // ... computed data from store and optionally ownProps
  // the PostList re-render when the post table is change
  return {
    isPostTableChange: store.observePosts()
  }
}
```



### useMeta
useConfig - get the store config
storeID - get the store unique ID

```jsx
import {useMeta} from 'react-rock'

const Comp = () => {
  const [val, setVal] = useMeta(key, default_val)

  return (
    <div>
        
    </div>
  )
}
```


### useConfig & storeID
useConfig - get the store config
storeID - get the store unique ID

```jsx
import {useConfig, storeID} from 'react-rock'

const Comp = () => {
  const config = useConfig()
  const store_id = storeID()

  return (
    <div>
        
    </div>
  )
}

```




## Config Parames
```js
{

  // Assign the store tables
  tables: ['Posts', 'Users'],

  rawStore: false,

  // call after store is ready
  onReady: () => {

  },


  // call every store update
  onUpdate: () => {

  },

  // Custom Keys
  keys: {
    user_option: 'user_option_key'
  }


  // Custom methods
  methods: {

    // we can use this method in the component
    // store.getUserById(user_id)

    getUserById: (id) => {
      const store =  useStore()
      const getUser = store.getUsers({userId: id})
      if(getUser){
        return getUser
      }
    }
  }
}

```








## CRUD
we can insert, update, delete, read the store data with the store core function


### Insert
```js
store.inserPosts({title: '', content: ''})
store.insertManyPosts([{}, {}])
store.insertAfterPosts({title: '', content: ''}, targetIndex)
```


### Update
```js
store.updatePosts({title: 'new title'}, where) // you can check the where expression below
store.updateAllPosts({title: 'new title'}) // you can check the where expression below
```


### Delete
```js
store.deletePosts(where) // you can check the where expression below
```


### Read
```js
store.getPosts(where) // you can check the where expression below
store.getAllPosts()
```

### Others
```js
store.movePosts(oldIndex, newIndex) // you can check the where expression below
store.getAllPosts()
store.countPosts() // get the single row with where condition
store.getPostsIndex(_id) // get the single row with where condition
```





## Where Expression
Four type data we can pass in the where condition

### String|row_id
when insert a row then automatically create a unique row id with _id: col
If you pass string value then it will compare with row id to read the data
get the row with row id (_id)


### Object
get the rows match with object
{title: 'new title'}

### Number
number for get the row with the index

### jsonpath Expression
https://goessner.net/articles/JsonPath/
we can read the data with the jsonpath query
you must have to use the first charter @
example: '@.title'
example: '@.status === "publish" && @.view_count > 100'





## Row Predefine props
```js
{
  _id: uniqueId,
  observe: () => ({created: date, updated: date}), // 
}

```







## Store Meta data
we can also store meta datas if we need
just you can create a key in the config.keys then you can use the key for store the meta data.
there ara all the meta functions

```js

// Add or update meta data with the key
store.addMeta(key, {})
store.addMetas({
  key: val,
  key: val,
})

// get meta data with the key
store.getMeta(key)
store.getMetas([key, key])
store.getAllMeta()
store.getMetaInfo(key)
store.observeMeta(key)

// delete meta data
store.deleteMeta(key)
store.deleteMetas([key, key])
store.deleteAllMeta()


```





## Store Core Table Methods
```js
// Create new Table
store.createTable(tablename)

// Check table is exists
store.hasTable(tablename)

// delete table
store.dropTable(tablename)

// read the table info
store.tableInfo(tablename)

// get the table create and update date and also get the rows length
store.tableInfo(tablename)



// read the table update info
store.observeTable(tablename)

```






## Global Methods

```js

// get full state
store.getState() 


store.getKeys('keyname') // read the key from the config.keys


// get store info
store.storeInfo()


// store data without dispatch
store.noDispatch(() => {
  store.inserPosts({})
})

```







## Custom methods from config

if you add any methods in config.methods then you can call the methods from the store object

```js

store.getUserById()

```





## Action
How action work

```js
// action.js
import {useStore} from 'react-rock'
export const clickHandle = () => {
  const store = useStore()

  // Now we can do CRUD here

}


// button.js
import {useStore} from 'react-rock'
import {clickHandle} from 'action'

const Button = () => {
  return <button onClick={clickHandle}>Insert</button>
}


```


## Utilities Functions
```js

import {
    uid, // generate unique id
    is_object, 
    is_string, 
    is_array, 
    in_array, 
    is_number, 
    is_callback, 
    is_callable, 
    is_define, 
    is_null,
    is_empty,
    getVal, 
} from 'react-rock'

is_obeject(obj, def) // return obj or def 
is_string(str, def) // return true or def 
is_array(arr, def) // return arr or def 
in_array(val, arr, def) // return true or def 
is_number(num, def) // return true or def 
is_callback(cb, def) // return cb or def 
is_callable(cb, def) // return cb or def 
is_define(val, def) // return val or def 
is_null(val, def) // return true or def 
getVal(obj, key, def) // return val or def 

```



## License

MIT © [devnax](https://github.com/devnax)
