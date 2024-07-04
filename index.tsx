import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createState, StoreComponent } from './src'

const rows = [
  {
    name: "nax",
    email: "nax@gamil.com",
    age: 20
  },
  {
    name: "najrul",
    email: "najrul@gamil.com",
    age: 30
  },
  {
    name: "nax1",
    email: "nax1@gamil.com",
    age: 40
  }
]


const store = createState()

class A extends StoreComponent {

  render() {
    const items: any = store.find({
      name: {
        contain: "nax"
      }
    })

    return (
      <div>
        {items.map((item: any, idx: any) => {
          return (
            <li key={idx}>{item.name}</li>
          )
        })}
      </div>
    )
  }
}





const App = () => {


  return (
    <div>
      <A />
      <button
        onClick={() => {
          store.create({
            name: Math.random()
          })
        }}
      >Add+</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
