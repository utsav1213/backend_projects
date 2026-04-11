import app from './app'
import "dotenv/config";
import http from 'http'
const PORT = Number(process.env.PORT || 4000);

const server = http.createServer(app);
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
server.listen(PORT, () => {
     console.log(`Chat API listening on http://localhost:${PORT}`);
})