import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createState, noDispatch, StateComponent } from './src'

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


type Row = {
  name: string;
  email: string;
  age: number;
}

const store = createState<Row, {}>()
store.createMany(rows)

class A extends StateComponent {

  render() {
    const items: any = store.find({
      name: {
        contain: "nax"
      }
    })

    const all = store.getAll()
    console.log(all);


    return (
      <div>
        {all.map((item, idx: any) => {
          return (
            <li key={idx}>{item.name} - {item._index}</li>
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
          noDispatch(() => {
            store.create({
              name: Math.random().toString()
            })
          })
        }}
      >Add+</button>
      <button
        onClick={() => {
          store.create({
            name: Math.random().toString()
          })
        }}
      >View</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
