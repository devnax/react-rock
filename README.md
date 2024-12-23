# React Rock Documentation

**React Rock** is a lightweight state management library designed for React applications. It simplifies state handling with a straightforward API, allowing developers to efficiently manage complex states.

- **NPM**: [react-rock](https://www.npmjs.com/package/react-rock)
- **GitHub**: [React Rock Repository](https://github.com/devnax/react-rock)

---

## Installation

To get started, install React Rock via npm:

```bash
npm install react-rock
```

## Core Concept

The core of React Rock is the `createStore` function. It enables developers to manage application state using an intuitive API for creating, updating, deleting, and querying state records.

---

## Usage

### Creating a Store

```tsx
import { createStore } from "react-rock";

// Define the shape of your state
interface Todo {
  title: string;
  completed: boolean;
}

// Create a store for managing Todos
const todoStore = createStore<Todo>();
```

### Adding Data

#### Single Record

```tsx
todoStore.create({ title: "Learn React Rock", completed: false });
```

#### Multiple Records

```tsx
todoStore.createMany([
  { title: "Write Documentation", completed: true },
  { title: "Push to GitHub", completed: false },
]);
```

### Querying Data

#### Retrieve All Records

```tsx
const allTodos = todoStore.getAll();
```

#### Find Records by Criteria

```tsx
const completedTodos = todoStore.find({ completed: true });
```

#### Find a Single Record by ID

```tsx
const todo = todoStore.findById("unique_id");
```

### Updating Data

#### Update Matching Records

```tsx
todoStore.update({ completed: true }, { title: "Push to GitHub" });
```

#### Update All Records

```tsx
todoStore.updateAll({ completed: false });
```

### Deleting Data

#### Delete Matching Records

```tsx
todoStore.delete({ completed: true });
```

#### Delete All Records

```tsx
todoStore.clearAll();
```

### Meta Data Management

React Rock supports storing metadata alongside your state:

#### Set Metadata

```tsx
todoStore.setMeta("lastUpdated", new Date());
```

#### Get Metadata

```tsx
const lastUpdated = todoStore.getMeta("lastUpdated");
```

#### Clear Metadata

```tsx
todoStore.clearMeta();
```

---

## Advanced Examples

### Pagination

```tsx
const paginatedTodos = todoStore.getAll({ skip: 0, take: 5 });
```

### Moving Records

```tsx
todoStore.move(0, 1); // Move record from index 0 to index 1
```

### Observing State Changes

React Rock integrates seamlessly with React hooks for real-time updates:

```tsx
const TodoList = () => {
  const todos = todoStore.getAll();

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo._id}>{todo.title}</li>
      ))}
    </ul>
  );
};
```

---

## API Reference

### `createStore`

Creates a new store for managing state.

#### Methods

- **`create(row: Row)`**: Adds a new record.
- **`createMany(rows: Row[])`**: Adds multiple records.
- **`update(row: Partial<Row>, where: WhereType<Row>)`**: Updates matching records.
- **`updateAll(row: Partial<Row>)`**: Updates all records.
- **`delete(where: WhereType<Row>)`**: Deletes matching records.
- **`clearAll()`**: Clears all records.
- **`find(where: WhereType<Row>)`**: Finds matching records.
- **`findById(id: string)`**: Finds a record by its ID.
- **`setMeta(key, value)`**: Sets metadata.
- **`getMeta(key)`**: Retrieves metadata.
- **`clearMeta()`**: Clears metadata.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/devnax/react-rock).

---

## License

React Rock is licensed under the MIT License.

