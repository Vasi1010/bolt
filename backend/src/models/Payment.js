const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    } ,
    amount: {
        type: Number,
        required: true,
        min: 0,

    },
    method: {
        type: String,
        enum: ["COD","ONLINE"],
        required: true,
    },
    status:{
        type: String,
        enum: ["pending","success","failed"],
        default: "pending",
    },
    gatewayPaymentId:{
        tpe: String,
        default: null,
    },

},
{
    timestamps: true,
});
module.exports = mongoose.model("Payment", paymentSchema);
