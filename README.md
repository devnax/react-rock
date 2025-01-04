<p align="center">
  <img width="120" src="https://raw.githubusercontent.com/devnax/react-rock/main/logo.png" alt="React Rock logo">
</p>

<h1 align="center">React Rock</h1>

React-Rock is a lightweight package for managing global state in React applications. It simplifies handling data by providing a store with rows and metadata, while offering methods to perform CRUD operations and more. It enables easy integration with React components, making it an ideal solution for managing complex state in large applications.


## Installation

To install the React-Rock package, run the following command in your project:

```bash
npm install react-rock
```

## Features

- **Global Store Management**: Manage rows and meta data in a global store.
- **CRUD Operations**: Perform create, read, update, and delete operations on rows.
- **Meta Management**: Set, get, and delete meta data.
- **Optimized Re-renders**: Control component re-renders with the `freeze` option.
- **Class Component Support**: Use the `StoreComponent` for integrating store data into class components.

## Basic Example: Creating a Store and Adding Records

To create a new store and add a record, use the `createStore` function. Here's an example:

```typescript
import { createStore } from 'react-rock';

// Define RowType and MetaType
type RowType = { name: string, age: number };
type MetaType = { totalRecords: number };

// Create a store
const users = createStore<RowType, MetaType>({ name: '', age: 0 }, { totalRecords: 0 });

// Add a new row to the store
users.create({ name: 'John Doe', age: 30 });
```

### RowType Explained

When a row is created, it will have the following properties:

```typescript
type RowType<Row> = Row & {
    _id: string;       // Unique identifier for the row
    _index: number;    // Index of the row in the store
    _observe: number;  // Internal property to track changes
}
```

Each row will include the original data (`Row`) and some additional properties like `_id`, `_index`, and `_observe`.

## Methods

Here’s a table with all available methods and their descriptions:

| Method                          | Description                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `create(row, freeze?)`          | Adds a new record to the store. Optionally, prevents re-rendering if `freeze` is `true`.     |
| `createMany(rows, freeze?)`     | Adds multiple records to the store. Optionally, prevents re-rendering if `freeze` is `true`. |
| `update(row, where, freeze?)`   | Updates records based on the condition specified in `where`.                                 |
| `updateAll(row, freeze?)`       | Updates all records in the store. Optionally, prevents re-rendering if `freeze` is `true`.   |
| `delete(where, freeze?)`        | Deletes records based on the condition specified in `where`.                                 |
| `move(oldIdx, newIdx, freeze?)` | Moves a record from one index to another.                                                    |
| `clearAll(freeze?)`             | Clears all records from the store. Optionally, prevents re-rendering if `freeze` is `true`.  |
| `getAll(args?)`                 | Retrieves all rows from the store.                                                           |
| `find(where, args?)`            | Finds rows based on a condition specified in `where`.                                        |
| `findFirst(where, freeze?)`     | Finds the first row that matches the condition in `where`.                                   |
| `findById(_id, freeze?)`        | Finds a row by its `_id`.                                                                    |
| `setMeta(key, value, freeze?)`  | Sets a value for a specific meta key.                                                        |
| `getMeta(key, freeze?)`         | Retrieves the value of a specific meta key.                                                  |
| `getAllMeta(freeze?)`           | Retrieves all meta data from the store.                                                      |
| `deleteMeta(key, freeze?)`      | Deletes a specific meta key.                                                                 |
| `clearMeta(freeze?)`            | Clears all meta data from the store.                                                         |

### Example of the `find` Method

The `find` method allows you to search for rows in the store based on specific conditions:

```typescript
const foundUsers = users.find({ name: 'John Doe' } });
console.log(foundUsers);
```


### Re-rendering in React Components

React-Rock optimizes re-renders by offering a freeze mechanism. When a store update occurs and the `freeze` option is enabled, React components that access the store using methods like `find` or `findFirst` will not automatically re-render. This gives you control over when your components should re-render, improving performance in large applications.


## WhereType

The `WhereType` is used to specify conditions when querying rows. It defines a query structure for filtering rows.

### QueryValueType

The `QueryValueType` is used within `WhereType` to define possible conditions for querying:

| Property       | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `contain`      | Finds values containing the specified string, number, or boolean. |
| `startWith`    | Finds values that start with the specified string or number.      |
| `endWith`      | Finds values that end with the specified string or number.        |
| `equalWith`    | Finds values that are exactly equal to the specified value.       |
| `notEqualWith` | Finds values that are not equal to the specified value.           |
| `gt`           | Finds values greater than the specified number.                   |
| `lt`           | Finds values less than the specified number.                      |
| `gte`          | Finds values greater than or equal to the specified number.       |
| `lte`          | Finds values less than or equal to the specified number.          |

### Example of WhereType

```typescript
const usersOver30 = users.find({ age: { gt: 30 } });
console.log(usersOver30);
```

## ArgsType

The `ArgsType` defines options for customizing query behavior, such as selecting specific rows or skipping rows.

| Property | Description                                               |
| -------- | --------------------------------------------------------- |
| `getRow` | Custom function to process rows before returning them.    |
| `skip`   | Number of rows to skip.                                   |
| `take`   | Number of rows to return.                                 |
| `freeze` | If `true`, prevents re-rendering when accessing the data. |

## Example with Class Component

To use the store in a class component, extend the `StoreComponent` class:

```typescript
import { StoreComponent } from 'react-rock';

class UserList extends StoreComponent {
    render() {
        const allUsers = users.getAll();
        return (
            <div>
                {allUsers.map(user => <div key={user._id}>{user.name}</div>)}
            </div>
        );
    }
}
```

## CRUD Example

```typescript
// Create a new user
users.create({ name: 'Alice', age: 25 });

// Update a user
users.update({ age: 26 }, { name: 'Alice' } });

// Delete a user
users.delete({ name: 'Alice' } });
```

## Examples with `find` and Query

```typescript
// Find users over the age of 25
const usersOver25 = users.find({ age: { gt: 25 } });
console.log(usersOver25);

// Find the first user with the name 'Alice'
const alice = users.findFirst({ name: 'Alice' } });
console.log(alice);
```

## Example of Using the Store in Multiple Components

React-Rock allows you to share the same store across multiple components, ensuring a consistent state throughout the app:

```typescript
import { StoreComponent } from 'react-rock';

class UserList extends StoreComponent {
    render() {
        const users = users.getAll();
        return (
            <div>
                {users.map(user => <div key={user._id}>{user.name}</div>)}
            </div>
        );
    }
}

class UserProfile extends StoreComponent {
    render() {
        const user = users.findFirst({ name: 'John Doe' });
        return <div>{user ? user.name : 'User not found'}</div>;
    }
}
```



## Explanation of Types

- **RowType**: Represents a record with an `_id`, `_index`, and `_observe` along with user-defined data fields.
- **ArgsType**: Defines the options for querying rows with flexibility like skipping, taking, and custom row processing.
- **WhereType**: Represents the conditions for querying records, using fields like `contain`, `equalWith`, and range queries like `gt`, `lt`, etc.
- **QueryValueType**: Specifies the allowed condition types for filtering rows based on field values.


## License

This package is licensed under the MIT License.

---

This documentation should provide a concise overview of how to use the `react-rock` package effectively.

## 🤝 Contributing

Contributions are welcome! Please check out the [contribution guidelines](https://github.com/devnax/react-rock).

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).