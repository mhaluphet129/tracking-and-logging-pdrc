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
    type: {
      type: String, // minor, moderate, high
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
      ref: "Visitor",
    },
    timeIn: {
      type: Date,
      required: true,
    },
    timeOut: {
      type: Date,
      required: true,
    },
    timeOutDone: {
      type: Boolean,
      default: false,
    },
    timeOutTimeAfterDone: {
      type: Date,
    },
    date: {
      type: Date,
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
  },
  { timestamps: true }
);

export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
