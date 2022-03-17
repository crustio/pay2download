import Mock from "../mock";

const fileDB = {
  files: [
    {
      id: "lkfjdfjdsjdslgkfjdskjfds",
      name: "《泰坦尼克号》+ 中文字幕",
      numberOfFiles: 2,
      size: 1.9,
      price: 0.1
    },
    {
      id: "fkjjirewoigkjdhvkcxyhuig",
      name: "《泰坦尼克号》+ 中文字幕",
      numberOfFiles: 1,
      size: 0.5,
      price: 0.2
    },
    {
      id: "fdskjkljicuviosduisjd",
      name: "《泰坦尼克号》+ 中文字幕",
      numberOfFiles: 7,
      size: 5.9,
      price: 0.5
    },
    {
      id: "fdskfjdsuoiucrwevbgd",
      name: "《泰坦尼克号》+ 中文字幕",
      numberOfFiles: 3,
      size: 1.5,
      price: 0.2
    }
  ]
};

Mock.onGet("/api/files").reply(config => {
  const id = config.data;
  const response = fileDB.files.find(file => file.id === id);
  return [200, response];
});