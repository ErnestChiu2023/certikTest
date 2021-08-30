import { useEffect, useState } from 'react';
import { Table, Space, Input, message, Upload, Button } from 'antd';
import { Link } from "react-router-dom";
const axios = require('axios');

const { Search } = Input;

const columns = [
  {
    title: 'File Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <Link to={'/edit/' + record.name}>edit</Link>
      </Space>
    ),
  },
];


const FileListComponent = () => {
  const [files, setFiles] = useState([])
  const [newFileName, setNewFileName] = useState('')

  const uploadFile = (e) => {
    var formData = new FormData();
    formData.append("newFile", e.file);
    axios.post('http://localhost:5000/uploadFile', formData, {
      headers: {
      'Content-Type': 'multipart/form-data'
    }})
    .then((response) => {
      message.info(e.file.name  + ' was uploaded successfully');
      console.log(response);
    }, (error) => {
      message.info('error uploading');
      console.log(error);
    });
  }

  const onSearch = () => {
    axios.post('http://localhost:5000/addFile', {
      fileName: newFileName,
    })
    .then((response) => {
      message.info(newFileName + ' was created successfully')
      console.log(response);
    }, (error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    axios.get('http://localhost:5000/getFiles')
      .then(function (response) {
        // handle success
        setFiles(response.data)
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  }, [])

  return (
    <div>
      <Search
      placeholder="file.txt"
      enterButton="Create File"
      size="large"
      onSearch={onSearch}
      value={newFileName}
      onChange={(e) => setNewFileName(e.target.value)}
      />
      <Upload customRequest={uploadFile} showUploadList={false}>
        <Button>Click to Upload</Button>
      </Upload>
      <Table columns={columns} dataSource={files} />
    </div>
  );
}

export default FileListComponent;
