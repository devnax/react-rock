### React Rock
`react-rock` is a very powerfull react state management system library. you can use it with your small and big application.


### How to use
`UserHandler.js`
```js
import {createState} from 'react-rock'

const User = createState()

export default User
```

```jsx
import User from 'UserHandler'

const App = () => {
    const items = User.getAll()

    return(
        <div>
            <ul>
                {
                    items.map(item => ...)
                }
            </ul>
            <button onClick={() => {
                User.insert({
                    name: "",
                    email: ""
                })
            }}>Add Item</button>
        </div>
    )
}

```

## How to use in class component
```js
import {StateComponent} from 'react-rock'
import User from 'UserHandler'

class View extends StateComponent{

  render(){
    const items = User.getAll()

    return (
      <div>
          <ul>
            {
                items.map(item => ...)
            }
          </ul>
          <button onClick={() => {
                User.insert({
                    name: "",
                    email: ""
                })
          }}>Add Item</button>
        </div>
    )
  }
}

```

## Methods

```js
import User from 'UserHandler'
const users = User.find({name: "nax"})

const users = User.find({
  name: {
    contain: "abc",
    startWith: "a",
    endWith: "@",
  }
})

const users = User.find({
  age: {
    lt: 20,
    gt: 10,

    lte: 20,
    gte: 10
  }
})

```