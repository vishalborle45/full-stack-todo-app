const signup = document.querySelector('.signup')
const signup_btn = signup.querySelector('#signup-btn')
const signin_link = signup.querySelector('#signin_link')

const signin = document.querySelector('.signin')


const signin_btn = signin.querySelector('#signin-btn')
const signup_link = signin.querySelector("#signup_link")

const todo = document.querySelector('.todopage')

// Switch from signup to signin page
signin_link.addEventListener('click', () => {
    signup.style.display = 'none'
    signin.style.display = 'flex'
})

// Switch from signin to signup page
signup_link.addEventListener('click', () => {
    signin.style.display = 'none'
    signup.style.display = 'flex'
})

// Signup logic

if(localStorage.getItem('token')){
     signup.style.display = 'none'
     signin.style.display = 'none'
     todo.style.display = 'block'
     todos()

}else{
     signup.style.display = 'none'
     signin.style.display = 'flex'
     todo.style.display = 'none'

}
signup_btn.addEventListener('click', async () => {
    try {
        const email = signup.querySelector('#signup-email').value
        const password = signup.querySelector('#signup-password').value
        const username = signup.querySelector('#signup-username').value

        const response = await axios.post('http://localhost:3000/signup', {
            email,
            password,
            username
        })

        console.log(response)

        if (response.status === 200) {
            signup.style.display = 'none'
            signin.style.display = 'flex'
        }
    } catch (error) {
        console.error("Signup failed:", error)
    }
})

// Signin logic
signin_btn.addEventListener('click', async () => {
    try {
        const email = signin.querySelector("#signin-email").value
        const password = signin.querySelector("#signin-password").value

        const response = await axios.post('http://localhost:3000/signin', {
            email,
            password,
        })

        localStorage.setItem('token', response.data.token)

        if (response.status === 200) {
            signin.style.display = 'none'
            todo.style.display = 'block'
            todos() // Load todos after signing in
        }
    } catch (error) {
        console.error("Signin failed:", error)
    }
})

// Add a todo
const add_todo = todo.querySelector('#addTodo')
add_todo.addEventListener('click', async () => {
    try {
        const title = todo.querySelector('#add_todo').value

        const response = await axios.post('http://localhost:3000/createtodo', {
            title,
            status: false,
        }, {
            headers: {
                token: localStorage.getItem('token')
            }
        })

        console.log(response)
        if (response.status === 200) {
            console.log("Todo added")
            todo.querySelector('#add_todo').value = '' // Clear input after adding todo
            todos() // Refresh todo list
        }
    } catch (error) {
        console.error("Add todo failed:", error)
    }
})

// Fetch and display todos
async function todos() {
    const todos_list = todo.querySelector('.todos_list')
    todos_list.innerHTML = "" // Clear existing todos

    const token = localStorage.getItem('token')
    if (!token) {
        console.error("No token found, please sign in.")
        return
    }

    try {
        const response = await axios.get('http://localhost:3000/todos', {
            headers: {
                token: token
            }
        })

        response.data.todos.map((todo) => {
            const task_div = document.createElement('div')
            const delete_btn = document.createElement('button')
            const update_btn = document.createElement('button')
            const title = document.createElement('h4')
            const btns_div = document.createElement('div')

            title.innerHTML = todo.title
            delete_btn.innerHTML = "Delete"
            update_btn.innerHTML = "Update"
            const id = todo._id

            delete_btn.addEventListener('click', () => {
                delete_todo(id)
            })
            update_btn.addEventListener('click', () => {
                update_todo(id)
            })

            title.setAttribute('class', 'title')
            btns_div.setAttribute('class', 'buttons')
            update_btn.setAttribute('id', 'update_btn')

            task_div.setAttribute('id', `${id}`)
            task_div.appendChild(title)
            btns_div.appendChild(delete_btn)
            btns_div.appendChild(update_btn)
            task_div.appendChild(btns_div)

            todos_list.appendChild(task_div)
        })
    } catch (error) {
        console.error("Fetching todos failed:", error)
    }
}

// Delete a todo
async function delete_todo(todoId) {
    try {
        const response = await axios.post('http://localhost:3000/deletetodo', {
            todoId
        }, {
            headers: {
                token: localStorage.getItem('token')
            }
        })

        console.log(response)
        todos() // Refresh todos after deletion
    } catch (error) {
        console.error("Delete todo failed:", error)
    }
}

// Update a todo
async function update_todo(todoId) {
    const _id = todoId
    const todo_div = document.getElementById(_id)
    const update_btn = todo_div.querySelector('#update_btn')
    update_btn.style.display = 'none'

    const title = todo_div.querySelector('.title')
    const newInput = document.createElement('input')
    const save_btn = document.createElement('button')

    newInput.type = 'text'
    newInput.setAttribute('class','update_input')
    newInput.value = title.innerText

    todo_div.replaceChild(newInput, title)
    save_btn.innerHTML = "Save"

    const btns_div = todo_div.querySelector('.buttons')
    btns_div.appendChild(save_btn)

    save_btn.addEventListener('click', async () => {
        try {
            const updated_title = newInput.value
            const response = await axios.post('http://localhost:3000/updatetodo', {
                title: updated_title,
                _id,
            }, {
                headers: {
                    token: localStorage.getItem('token')
                }
            })

            console.log(response)

            if (response.status === 200) {
                title.innerHTML = updated_title
                todo_div.replaceChild(title, newInput)
                btns_div.removeChild(save_btn)
                update_btn.style.display = 'block'
            }
        } catch (error) {
            console.error("Update todo failed:", error)
        }
    })
}

const logout_btn = document.querySelector('#logout')
logout_btn.addEventListener('click',()=>{
    localStorage.removeItem('token')
     signup.style.display = 'none'
     signin.style.display = 'flex'
     todo.style.display = 'none'
})