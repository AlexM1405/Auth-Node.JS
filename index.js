import express from "express"
import { Port, SECRECT_KEY } from "./config.js"
import { UserRepository } from "./user-repo.js"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

app.use("view engine", "ejs")

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
    const token = req.cookies.access_token
    req.session = {user: null}

    try {
        data = jwt.verify(token, SECRECT_KEY)
        req.session.user = data
    } catch {}

    next()
})


app.get("/", (req, res) => {
    const {user} = req.session.user
    res.render("index", user)
})

app.post("/login", (req, res) => {

    const {username, password} = req.body
    try {
        const user = UserRepository.login({username, password})
        const token = jwt.sign({ id: user._id, username: user.username}, SECRECT_KEY, {
            expiresIn: "1h"
        }  )
        res
            .cookie("access_token", token, {
                httpOnly: true,
                secure:true,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60
            })
            .send({user})
    } catch (err) {
        res.status(401).send(err.message)
    }
})


app.post("/register", (req, res) => {
    const { username, password } = req.body
    console.log(req.body)

    try {
        const id = UserRepository.create({ username, password})
        res.send({id})
    } catch(err) {
        res.status(400).send(err.message)
    }

})

app.post("/logout", (req, res) => {
    res
        .clearCookie("access_token")
        .json({ message: "Logout Successful"})
})


app.get("/protected", (req, res) => {
    const {user} = req.session
    if (!user) return res.status(403).send("Access not Authorized")
     res.render("protected", data)
})

app.listen(Port, () => {
    console.log(`Server is running on port http://localhost:${Port}`)
})