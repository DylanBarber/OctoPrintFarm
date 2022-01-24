import logo from './logo.svg';
import './App.css';
import * as axios from 'axios'
const { ipcRenderer } = window.require("electron");

// const electron = window.require('electron')
// const remote = electron.remote
// const {BrowserWindow, dialog, Menu} = remote
const fs = window.require('fs')
const path = window.require('path')


function App() {

  // function test() {
  //   const test1 = fs.readFileSync(document.getElementById('file').value)
  //   console.log(document.getElementById('file').value)
  // }

  const submitForm = async () => {
    const res = await ipcRenderer.sendSync('openDialog')
    console.log(res.filePaths[0])
    // const fileData = await fs.readFileSync(res.filePaths[0], {encoding:'utf8', flag:'r'})
    // const fileData = await fs.createReadStream(res.filePaths[0], {encoding:'utf8', flag:'r'})
    const fileData = await fs.readFileSync(res.filePaths[0])
    const fileBlob = new Blob(fileData)



    const formData = new FormData()
    formData.append('file', fileBlob, 'readStreamTest.gcode')
    formData.append('select', true)
    formData.append('print', false) // TODO: Put conditional check box for starting print immediately here!
    


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
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {/* <button onClick={() => test()}>Test</button> */}
        <input id='file' type='file'></input>
        <button onClick={async () => await submitForm()}>Test</button>
      </header>
    </div>
  );
}

export default App;
