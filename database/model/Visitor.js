let mongoose = require("mongoose");

let VisitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    middlename: {
      type: String,
    },
    lastname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Regions",
    },
    province: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Province",
    },
    citymunicipalities: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "CityMunicipality",
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Visitor ||
  mongoose.model("Visitor", VisitorSchema);
