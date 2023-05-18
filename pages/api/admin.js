import Admin from "../../database/model/Admin";
import dbConnect from "../../database/dbConnect";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case "GET":
      return new Promise(async (resolve, reject) => {
        await Admin.find()
          .then((e) => {
            res.json({
              status: 200,
              message: "Successfully fetched the data",
              admins: e,
            });
            resolve();
          })
          .catch(() => {
            res
              .status(500)
              .json({ status: 500, message: "Error in the server" });
          });
      });
    case "POST": {
      return new Promise(async (resolve, reject) => {
        const { email, mode } = req.body.payload;

        switch (mode) {
          case "add-admin": {
            let currentAdmin = await Admin.find({ email });

            if (currentAdmin.length > 0) {
              res.json({
                status: 409,
                message: "This email is already registered.",
              });
            }

            let newAdmin = Admin({ email });
            await newAdmin
              .save()
              .then(async () => {
                res.json({
                  status: 200,
                  message: "Admin added successfully",
                });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "update-admin": {
            let { id, data } = req.body.payload;

            return Admin.findOneAndUpdate({ _id: id }, { $set: { ...data } })
              .then(() => {
                res.json({ status: 200, message: "Successfully updated" });
                resolve();
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Error: " + err });
              });
            break;
          }
          case "change-pass-admin": {
            let { id, password } = req.body.payload;

            return await Admin.findOneAndUpdate(
              { _id: id },
              { $set: { password } }
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
            break;
          }
        }
      });
    }
    case "DELETE": {
      return new Promise(async (resolve, reject) => {
        const { id } = req.query;
        return await Admin.findOneAndDelete({ _id: id })
          .then(() => {
            res.json({ status: 200, message: "Sucessfully deleted" });
            resolve();
          })
          .catch((err) => {
            res.status(500).json({ success: false, message: "Error: " + err });
          });
      });
    }
    default:
      res.status(400).json({ success: false });
  }
}
