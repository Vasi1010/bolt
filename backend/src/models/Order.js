const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        
        },
        price: {
            type: Number,
            required: true,
            min: 0,

        },
        quantity: {
            type: Number,
            required: true ,
            min: 1,

        },
    },    
        {_id: false}

    
);
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,

        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,

        },
        status: {
            type: String,
            enum:["pending","confirmed","delivered","cancelled"],
            default:"pending",
        },
    },
    { timestamps: true, 

        }
    
);
module.exports = mongoose.model("Order", orderSchema);