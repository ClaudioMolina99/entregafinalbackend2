import ticketModel from "../../models/ticket.js";

export default class TicketsManager {
  createTicket(data) {
    return ticketModel.create(data);
  }
}