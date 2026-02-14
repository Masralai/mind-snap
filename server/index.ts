import express from "express"
import type {Request,Response} from "express"
import { Server } from "socket.io"

const app = express()


app.get("/",(req:Request,res:Response)=>{
    res.send("eheh , something to do here")
})

app.listen(3000,()=>{
    console.log("server live on http://localhost:3000")
})