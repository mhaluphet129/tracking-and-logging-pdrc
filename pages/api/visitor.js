import Visitor from "../../database/model/Visitor";
import Visit from "../../database/model/Visit";
import dbConnect from "../../database/dbConnect";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        const { mode } = req.query;

        switch (mode) {
          case "fetch-all": {
            if (req.query.search != "") {
              const { search } = req.query;
              return await Visitor.find({ _id: search }).then((e) => {
                res.json({
                  status: 200,
                  message: "Successfully fetched the data",
                  visitor: e,
                });
                resolve();
              });
            } else {
              return await Visitor.find().then((e) => {
                res.json({
                  status: 200,
                  message: "Successfully fetched the data",
                  visitor: e,
                });
                resolve();
              });
            }
          }
          case "search-visitor": {
            const { searchKeyword } = req.query;
            var re = new RegExp(searchKeyword.trim(), "i");

            return await Visitor.find({
              $or: [
                { lastname: { $regex: re } },
                { name: { $regex: re } },
                { middlename: { $regex: re } },
              ],
            })
              .collation({ locale: "en" })
              .sort({ name: 1 })
              .then((e) => {
                res.json({ status: 200, searchData: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "filter-visitor": {
            const { filter } = req.query;
            let _ = JSON.parse(filter);

            let option = [];

            if (_.hasOwnProperty("gender")) option.push({ gender: _.gender });
            if (_.hasOwnProperty("withPension"))
              option.push({ "pensionStatus.withPension": _.withPension });
            if (_.hasOwnProperty("address"))
              option.push({ address: _.address });
            if (_.hasOwnProperty("status"))
              option.push({ status: { $in: [..._.status] } });
            if (_.hasOwnProperty("ageRange"))
              option.push({
                age: {
                  $gte: _.ageRange.from,
                  $lte: _.ageRange.to,
                },
              });
            await Visitor.find({ $and: [...option] })
              .then((e) => {
                res.json({ status: 200, searchData: e });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            resolve();
          }
          case "get-visitor": {
            const { id } = req.query;

            return await Visitor.findOne({ _id: id })
              .then((e) => {
                res.json({ status: 200, message: "Success", data: e });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "check-isTimeIn": {
            const { id } = req.query;
            return await Visit.find({ visitorId: id })
              .then((e) => {
                let timeOut = true;

                e.forEach((e) => {
                  timeOut = e.timeOutDone;
                });
                res.json({
                  status: 200,
                  message: "Success",
                  data: { timeOut },
                });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
        }
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { mode } = req.body.payload;

        switch (mode) {
          case "add-visitor": {
            let newVisitor = Visitor(req.body.payload.visitor);

            return await newVisitor
              .save()
              .then(() => {
                res.json({ status: 200, message: "Successfully Added" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
          case "update-visitor": {
            const { id } = req.body.payload;
            console.log("im called");

            delete req.body.payload.data._id;
            delete req.body.payload.data.createdAt;
            delete req.body.payload.data.updatedAt;
            delete req.body.payload.data.__v;

            return await Visitor.findOneAndUpdate(
              { _id: id },
              { $set: { ...req.body.payload.data } }
            )
              .then(() => {
                res.json({ status: 200, message: "Successfully updated" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
          }
        }
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
