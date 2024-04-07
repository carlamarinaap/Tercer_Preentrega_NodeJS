import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  // ademas de id y code que deben ser autogenerados
  purchase_datetime: String, //Deberá guardar la fecha y hora exacta en la cual se formalizó la compra (básicamente es un created_at)
  amount: Number,
  purchaser: String,
});

export default mongoose.model("Tickets", TicketSchema);
