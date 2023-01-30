import Visitor from "../../database/model/Visitor";
import Visit from "../../database/model/Visit";
import Item from "../../database/model/Item";
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
            return await Visitor.aggregate([
              {
                $lookup: {
                  from: "items",
                  localField: "_id",
                  foreignField: "ownerId",
                  pipeline: [],
                  as: "items",
                },
              },
              {
                $lookup: {
                  from: "regions",
                  localField: "region",
                  foreignField: "_id",
                  as: "region",
                },
              },
              {
                $unwind: "$region",
              },
              {
                $lookup: {
                  from: "provinces",
                  localField: "province",
                  foreignField: "_id",
                  as: "province",
                },
              },
              {
                $unwind: "$province",
              },
              {
                $lookup: {
                  from: "citymunicipalities",
                  localField: "citymunicipalities",
                  foreignField: "_id",
                  as: "citymunicipalities",
                },
              },
              {
                $unwind: "$citymunicipalities",
              },
            ]).then((e) => {
              res.json({
                status: 200,
                message: "Successfully fetched the data",
                visitor: e,
              });
              resolve();
            });
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
          case "remove": {
            const { id } = req.query;

            return await Visitor.findOneAndDelete({ _id: id })
              .then(async () => {
                await Visit.deleteMany({ visitorId: id }).catch((err) => {
                  res
                    .status(500)
                    .json({ success: false, message: "Error: " + err });
                });
                res.json({ status: 200, message: "Removed successfully" });
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
