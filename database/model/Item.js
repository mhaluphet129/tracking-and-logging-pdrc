let mongoose = require("mongoose");

let ItemsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Visitor",
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Item",
    },
    depositDate: {
      type: String,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Items || mongoose.model("Items", ItemsSchema);
