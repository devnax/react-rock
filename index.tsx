import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createState, noDispatch, StateComponent } from './src'

const rows = [
  {
    name: "nax",
    email: "nax@gamil.com",
    age: 10
  },
  {
    name: "nax",
    email: "nax@gamil.com",
    age: 10
  },
  {
    name: "nax",
    email: "nax1@gamil.com",
    age: 3
  },
  {
    name: "nax",
    email: "nax1@gamil.com",
    age: 4
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

store.create({
  name: "Naxrul",
  email: "naxrul@gmail.com",
  age: 20
})

function A() {
  const [email, setEmail] = React.useState("nax@gamil.com")
  const all = store.getAll()

  return (
    <div>
      {all.map((item, idx: any) => {
        const sub = store.find({ email: item.email }, { detect: false })
        console.log(sub);

        return (
          <li key={idx}>{item.email} - {item.name}</li>
        )
      })}
      <button
        onClick={() => {
          setEmail("nax1@gamil.com")
        }}
      >Set Email</button>
    </div>
  )
}



const App = () => {
  return (
    <div>
      <A />
      <button
        onClick={() => {
          noDispatch(() => {
            store.create({
              name: Math.random().toString(),
              email: "",
              age: 20
            })
          })
        }}
      >Add+</button>
      <button
        onClick={() => {
          store.create({
            name: Math.random().toString(),
            email: "",
            age: 20
          })
        }}
      >View</button>
      <button
        onClick={() => {
          store.delete({ name: "nax" })
        }}
      >Delete</button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
