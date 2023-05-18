let mongoose = require("mongoose");

let ItemsSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
    },
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
    status: {
      type: String,
      default: "unclaimed",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Items || mongoose.model("Items", ItemsSchema);
