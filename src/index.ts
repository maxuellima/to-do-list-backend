import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB, TTaskDB, TUserTaskDB, TTasksWithUsers } from './type'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.name as string | undefined;

        if(searchTerm === undefined){            
            const result = await db("users")
            res.status(200).send(result)
        }else{
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }     
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const {id, name, email, password} = req.body

        if(typeof id !== "string"){
            res.status(400)
            throw new Error("'id' deve ser string")
        }
        if(id.length < 4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }
        
        if(typeof name !== "string"){
            res.status(400)
            throw new Error("'name' deve ser string")
        }
        if(name.length < 2){
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 2 caracteres")
        }

        if(typeof email !== "string"){
            res.status(400)
            throw new Error("'email' deve ser string")
        }
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			res.status(400)
            throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        const [userIdAlreadyExists]: TUserDB[] | undefined = await db("users").where({id})

        if(userIdAlreadyExists){
            res.status(400)
            throw new Error("'id' já existe, crie com um id diferente")
        }

        const [userEmailAlreadyExists]: TUserDB[] | undefined = await db("users").where({email})

        if(userEmailAlreadyExists){
            res.status(400)
            throw new Error("'email' já existe, faça o login ou cadastre um email diferente")
        }

        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)

        res.status(201).send({message: "User criado com sucesso", user: newUser})



    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//DELETE/users
app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id;

        if(idToDelete[0] !== "f"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 'f '")
        }

        const [userIdAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({id: idToDelete})
      
        
        if(!userIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' não existe! Digite um 'id' válido")

        }
        await db("users").del().where({id: idToDelete})
        res.status(200).send({message: "User deletado com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.name as string | undefined;

        if(searchTerm === undefined){            
            const result = await db("tasks")
            res.status(200).send(result)
        }else{
            const result = await db("tasks").where("title", "LIKE", `%${searchTerm}%`)
            .orWhere("description", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }     
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks", async (req: Request, res: Response) => {
    try {
        const {id, title, description} = req.body

        if(typeof id !== "string"){
            res.status(400)
            throw new Error("'id' deve ser string")
        }
        if(id.length < 4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }
        
        if(typeof title !== "string"){
            res.status(400)
            throw new Error("'title' deve ser string")
        }
        if(title.length < 2){
            res.status(400)
            throw new Error("'title' deve possuir pelo menos 2 caracteres")
        }

        if(typeof description !== "string"){
            res.status(400)
            throw new Error("'description' deve ser string")
        }
        
        const [taskIdAlreadyExists]: TTaskDB[] | undefined = await db("tasks").where({id})

        if(taskIdAlreadyExists){
            res.status(400)
            throw new Error("'id' já existe, crie com um id diferente")
        }

        const newTask = {
            id,
            title,
            description
        }

       await db("tasks").insert(newTask)

       const [insertedTask] : TTaskDB[] = await db("tasks").where({id})

        res.status(201).send({message: "Tarefa criada com sucesso", task: insertedTask})

    }
    catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.createdAt
        const newStatus = req.body.status

        if (newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }
    
            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir pelo menos 4 caracteres")
            }
        }

        if (newTitle !== undefined) {
            if (typeof newTitle !== "string") {
                res.status(400)
                throw new Error("'title' deve ser string")
            }
    
            if (newTitle.length < 2) {
                res.status(400)
                throw new Error("'title' deve possuir pelo menos 2 caracteres")
            }
        }

        if (newDescription !== undefined) {
            if (typeof newDescription !== "string") {
                res.status(400)
                throw new Error("'description' deve ser string")
            }
        }

        if (newCreatedAt !== undefined) {
            if (typeof newCreatedAt !== "string") {
                res.status(400)
                throw new Error("'createdAt' deve ser string")
            }
        }

        if (newStatus !== undefined) {
            if (typeof newStatus !== "number") {
                res.status(400)
                throw new Error("'status' deve ser number (0 para incompleta ou 1 para completa)")
            }
        }

        const [ taskToEdit ]: TTaskDB[] | undefined[] = await db("tasks").where({ id: idToEdit })

        if (!taskToEdit) {
            res.status(404)
            throw new Error("'id' não encontrada")
        }

        const newTask: TTaskDB = {
            id: newId || taskToEdit.id,
            title: newTitle || taskToEdit.title,
            description: newDescription || taskToEdit.description,
            created_at: newCreatedAt || taskToEdit.created_at,
            status: isNaN(newStatus) ? taskToEdit.status : newStatus
        }

        await db("tasks").update(newTask).where({ id: idToEdit })

        res.status(200).send({
            message: "Task editada com sucesso",
            task: newTask
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


app.delete("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id;

        if(idToDelete[0] !== "t"){
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 't '")
        }

        const [taskIdToDelete]: TTaskDB[] | undefined[] = await db("tasks").where({id: idToDelete})
      
        
        if(!taskIdToDelete) {
            res.status(400)
            throw new Error("'id' não existe! Digite um 'id' válido")

        }
        await db("tasks").del().where({id: idToDelete})
        res.status(200).send({message: "Task deletada com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.params.userId;

        if(taskId[0] !== "t"){
            res.status(400)
            throw new Error("'taskId' deve iniciar com a letra 't '")
        }

        if(userId[0] !== "f"){
            res.status(400)
            throw new Error("'userId' deve iniciar com a letra 'f '")
        }

        const [taskIdToDelete]: TTaskDB[] | undefined[] = await db("tasks").where({id: taskId})
              
        if(!taskIdToDelete) {
            res.status(400)
            throw new Error("'taskId' não existe! Digite um 'id' válido")
        }

        const [userIdToDelete]: TTaskDB[] | undefined[] = await db("users").where({id: userId})
      
        
        if(!userIdToDelete) {
            res.status(400)
            throw new Error("'userId' não existe! Digite um 'id' válido")
        }

        const newUserTask: TUserTaskDB = {
            task_id: taskId,
            user_id: userId

        }

        await db("users_tasks").insert(newUserTask)

        res.status(201).send({message: "User atribuído à tarefa"})
       
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.delete("/tasks/:taskId/users/:userId", async (req: Request, res: Response) => {
    try {
        const taskIdToDelete = req.params.taskId;
        const userIdToDelete = req.params.userId;

        if(taskIdToDelete[0] !== "t"){
            res.status(400)
            throw new Error("'taskId' deve iniciar com a letra 't '")
        }

        if(userIdToDelete[0] !== "f"){
            res.status(400)
            throw new Error("'userId' deve iniciar com a letra 'f '")
        }

        const [task]: TTaskDB[] | undefined[] = await db("tasks").where({id: taskIdToDelete})
              
        if(!task) {
            res.status(400)
            throw new Error("'taskId' não existe! Digite um 'id' válido")
        }

        const [user]: TTaskDB[] | undefined[] = await db("users").where({id: userIdToDelete})
      
        
        if(!user) {
            res.status(400)
            throw new Error("'userId' não existe! Digite um 'id' válido")
        }


        await db("users_tasks").del().
        where({task_id: taskIdToDelete})
        .andWhere({user_id: userIdToDelete})

        res.status(200).send({message: "User removido da tarefa com sucesso"})
       
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks/users", async (req: Request, res: Response) => {
    try {

        /*
        SELECT * FROM tasks
        LEFT JOIN users_tasks
        ON users_tasks.task_id = tasks.id
        LEFT JOIN users
        ON users_tasks.user_id = users.id;
        */
        
        // const result = await db("tasks")
        // .select(
        //     "tasks.id AS taskdId",
        //     "title",
        //     "description",
        //     "created_at AS createdAt",
        //     "status",
        //     "user_id AS userId",
        //     "name",
        //     "email",
        //     "password" 
        // )
        // .leftJoin("users_tasks", "users_tasks.task_id", "=", "tasks.id")
        // .leftJoin("users","users_tasks.user_id", "=", "users.id"  )

        const tasks: TTaskDB[] = await db("tasks")

        const result: TTasksWithUsers[]= []

        for(let task of tasks){
            const responsibles = []
            const users_tasks: TUserTaskDB[] = await db("users_tasks").where({task_id: task.id })
            
            for(let user_task of users_tasks){
                const [user]: TUserDB[] = await db("users").where({id:user_task.user_id})
                responsibles.push(user)

            }

            const newTaskWithUsers: TTasksWithUsers = {
                ...task,
                responsibles
            }
            result.push(newTaskWithUsers)
        }

        // res.status(200).send(result);
       
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})