import express from 'express'
const app = express();


app.use(express.json());

app.use('/', authRoutes);
app.listen(3000)