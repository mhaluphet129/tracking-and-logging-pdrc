let mongoose = require("mongoose");

let StatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

let RemarksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    hasViolation: {
      type: Boolean,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

let VisitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "visitor",
    },
    timeIn: {
      type: String,
      required: true,
    },
    timeOut: {
      type: String,
      required: true,
    },
    prisonerName: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    status: {
      type: [StatusSchema],
    },
    remarks: {
      type: [RemarksSchema],
    },
    depositItems: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
