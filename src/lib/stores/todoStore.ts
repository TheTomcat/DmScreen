import { writable } from "svelte/store";
import type { ToDos } from "../../app";


export const todos = writable<ToDos>([]);

export const addTodo = (text: string) => {
    todos.update((cur: ToDos) => {
        const newTodos = [...cur, { text, completed: false, id: Date.now() }];
        return newTodos;
    })
}

export const deleteTodo = (id: number) => {
    todos.update(todos => todos.filter(todo => todo.id !== id))
}

export const toggleTodo = (id: number) => {
    todos.update(todos => {
        return todos.map(todo => {
            return { ...todo, completed: (todo.id === id ? !todo.completed : todo.completed) };
        })
    })
}