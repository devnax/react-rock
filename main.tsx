import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createStore } from './src'

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

const store = createStore<Row, {}>()
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
          store.create({
            name: Math.random().toString(),
            email: "",
            age: 20
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




const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
