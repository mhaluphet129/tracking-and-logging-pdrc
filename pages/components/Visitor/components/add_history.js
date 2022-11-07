import { Modal } from "antd";

const AddHistory = ({ open, close }) => {
  return <Modal open={open} onCancel={close}></Modal>;
};

export default AddHistory;
