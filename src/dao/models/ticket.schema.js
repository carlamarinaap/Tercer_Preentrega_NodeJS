import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  code: {
    type: String,
    default: function () {
      // Generar un código automático
      return "COD" + Math.random().toString(36).substr(2, 6).toUpperCase();
    },
  },
  purchase_datetime: {
    type: String,
    required: true,
  },
  amount: Number,
  purchaser: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Tickets", TicketSchema);
