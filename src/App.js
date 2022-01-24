import logo from './logo.svg';
import './App.css';
import * as axios from 'axios'
import { useState } from 'react';
const { ipcRenderer } = window.require("electron");

// const electron = window.require('electron')
// const remote = electron.remote
// const {BrowserWindow, dialog, Menu} = remote
const fs = window.require('fs')
const path = window.require('path')


function App() {

  const [fileInfoState, setFileInfoState] = useState({
    filePath: undefined,
    fileName: undefined
  })

  const selectFile = async () => {

    // Call to main process for opening file dialog window
    const res = await ipcRenderer.sendSync('openDialog')

    const filePath = res.filePaths[0]

    //Get file name, Windows will use backslashes because it's an "awesome" OS
    let fileName = ''
    if (process.platform === 'win32') {
      fileName = filePath.split('\\').pop()
    } else {
      fileName = filePath.split('/').pop()
    }

    setFileInfoState({
      filePath,
      fileName
    })
  }

  const uploadFile = async () => {

    const { filePath, fileName } = fileInfoState

    if (!fileInfoState.filePath) {
      // TODO: Put validation errors
    } else {
      // Start the read buffer and slap that bad boy in a Blob for file upload
      const fileData = await fs.readFileSync(filePath)
      const fileBlob = new Blob(fileData)

      // Create FormData request object
      const formData = new FormData()
      formData.append('file', fileBlob, fileName)
      formData.append('select', true)
      formData.append('print', false) // TODO: Put conditional check box for starting print immediately here!

      //Send the axios request
      axios
        .post('http://192.168.0.190/api/files/local', formData, {
          headers: {
            ...formData.get('headers'),
            'X-Api-Key': 'C9FA6D1FD11F452383F4CF773436B70C',
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          alert("File Upload success");
        })
        .catch((err) => alert("File Upload Error"));
    }
  };

  return (
    <div className="App">
      <button onClick={async () => await selectFile()}>Select File</button>
      {fileInfoState.fileName ?? <p>{fileInfoState.fileName}</p>}
      <button onClick={async () => await uploadFile()}>Upload File</button>
    </div>
  );
}

export default App;
