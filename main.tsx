import * as React from "react";
import { createRoot } from "react-dom/client";
import createStore from "./src";
import { xv } from "xanv";

const rows = [
  {
    container: "ROOT",
    name: "nax",
    email: "nax@gamil.com",
    // age: 10
  },
  {
    container: "ROOT",
    name: "nax",
    email: "nax@gamil.com",
    age: 10,
  },
  {
    container: "ROOT",
    name: "nax",
    email: "nax1@gamil.com",
    age: 3,
  },
  {
    container: "service",
    name: "nax",
    email: "nax1@gamil.com",
    age: 4,
  },
  {
    container: "service",
    name: "najrul",
    email: "najrul@gamil.com",
    age: 30,
  },
  {
    container: "service",
    name: "nax1",
    email: "nax1@gamil.com",
    age: 40,
  },
];

const store = createStore(
  {
    container: xv.string(),
    name: xv.string().min(3).max(50),
    email: xv.string().min(5).max(100),
    age: xv.number().optional().min(1).max(150),
    fn: xv.function({ returns: xv.any(), args: [] }).optional(),
  },
  {
    appName: xv.string().default("React Rock App"),
    version: xv.string().default("1.0.0"),
  },
);

const d = store.createMany({
  disableObservation: false,
  data: rows,
});

function A() {
  const [email, setEmail] = React.useState("nax@gamil.com");
  const all = store.find({
    where: {
      container: "service",
    },
  });

  console.log(all);

  return (
    <div>
      {all.map((item, idx: any) => {
        return (
          <li key={idx}>
            #{item.rid} - {item.email} - {item.name} {item.vid}
          </li>
        );
      })}
      <button
        onClick={() => {
          setEmail("nax1@gamil.com");
        }}
      >
        Set Email
      </button>
    </div>
  );
}

const App = () => {
  return (
    <div>
      <A />
      <button
        onClick={() => {
          store.create({
            data: {
              container: "service",
              name: Math.random().toString(),
              email: `${Math.random().toString()}@gmail.com`,
              age: 20,
            },
          });
        }}
      >
        Add+
      </button>
      <button
        onClick={() => {
          store.update({
            data: {
              email: `${Math.random().toString().substring(2, 5)}@gmail.com`,
            },
            where: {
              name: "nax1",
            },
          });
        }}
      >
        UPDATE
      </button>
      <button
        onClick={() => {
          store.delete({
            where: {
              name: "nax",
            },
          });
        }}
      >
        Delete
      </button>
    </div>
  );
};

const rootEle = document.getElementById("root");
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
