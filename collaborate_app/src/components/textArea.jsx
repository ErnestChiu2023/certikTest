import { useEffect, useState } from 'react';
import { Input, Button, message } from 'antd';
import openSocket from 'socket.io-client';
import { useHistory, useParams } from "react-router-dom";

const { TextArea } = Input;


const TextAreaComponent = () => {
  const [file, setFile] = useState('')
  const [socket, setSocket] = useState(null)
  const history = useHistory();
  let { name } = useParams();


  useEffect(() => {
    if (!socket) {
      setSocket(openSocket('http://localhost:8000', {query: `fileName=${name}`}))
    }
  });

  useEffect(() => {
    if(socket) {
      socket.on('updatedMessage', (msg) => setFile(msg))
      socket.on('fileSaved', () => {
        message.info(name + ' was saved successfully')
      });
      return () => socket.close()
    }
  }, [socket])


  return (
    <div>
      <TextArea rows={10} value={file} onChange={(e) => socket.emit('textEdit', e.target.value)} />
      <Button type="primary" onClick={() => history.push('/')}>Back</Button>
      <Button type="primary" onClick={(e) => socket.emit('saveFile', name)}>Save</Button>
    </div>
  );
}

export default TextAreaComponent;
