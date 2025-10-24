import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/enviar", (req, res) => {
  console.log("Requisição recebida para pagamentos 1");
  res.json({ message: "Enviando pagamento...", api: 1 });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running in port: ${process.env.PORT}`);
});
