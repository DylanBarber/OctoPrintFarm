import './App.css';
import * as axios from 'axios'
import { useEffect, useState } from 'react';
import PrinterCard from './components/PrinterCard';
const { ipcRenderer } = window.require("electron");
const fs = window.require('fs')


function App() {

  const [fileInfoState, setFileInfoState] = useState({
    filePath: undefined,
    fileName: undefined
  })
  const [printerIp, setPrinterIp] = useState('');
  const [printerApiKey, setPrinterApiKey] = useState('');
  const [printerDefs, setPrinterDefs] = useState(undefined);
  const [printImmediately, setPrintImmediately] = useState(false);

  useEffect(() => {
    loadPrinterDefs();
  }, [])

  const loadPrinterDefs = async () => {
    try {
      const printerDefsData = await fs.readFileSync('~/Documents/octoFarm/printerDefs.json', { encoding: 'utf-8' });
      setPrinterDefs(JSON.parse(printerDefsData));
    } catch (err) {
      console.warn('No printer definitions file was found. System will assume that no printers have been added');
    }
  }

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
      
      // const fileData = await fs.readFileSync(filePath)
      // const fileBlob = new Blob(fileData, {type: 'text/html'})
      const fileData = fs.readFileSync(filePath, {encoding: 'utf-8'})
      const fileBlob = new Blob([fileData])
      // Create FormData request object
      // const formData = new FormData()
      // formData.append('file', fileBlob, fileName)
      // formData.append('select', true)
      // formData.append('print', printImmediately) // TODO: Put conditional check box for starting print immediately here!

      // //Send the axios request
      // axios
      //   .post('http://192.168.0.190/api/files/local', formData, {
      //     headers: {
      //       ...formData.get('headers'),
      //       'X-Api-Key': 'C9FA6D1FD11F452383F4CF773436B70C',
      //       'Content-Type': 'multipart/form-data'
      //     }
      //   })
      //   .then((res) => {
      //     alert("File Upload success");
      //   })
      //   .catch((err) => alert("File Upload Error"));

      printerDefs.forEach(printer => {
        if (printer.isChecked) {
          const formData = new FormData()
      formData.append('file', fileBlob, fileName)
      formData.append('select', true)
      formData.append('print', printImmediately) // TODO: Put conditional check box for starting print immediately here!

      //Send the axios request
      axios
        .post(`http://${printer.printerIp}/api/files/local`, formData, {
          headers: {
            ...formData.get('headers'),
            'X-Api-Key': printer.printerApiKey,
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          alert("File Upload success");
        })
        .catch((err) => alert("File Upload Error"));
        }
      })
    }
  };




  const addPrinter = async () => {

    try {
      const fileData = await fs.readFileSync('~/Documents/octoFarm/printerDefs.json', { encoding: 'utf-8' })
      const printerDefData = JSON.parse(fileData);
      // TODO: Add logic for adding duplicate printer IPs
      printerDefData.push({
        printerIp,
        printerApiKey
      });
      await fs.writeFileSync('~/Documents/octoFarm/printerDefs.json', JSON.stringify(printerDefData));
      loadPrinterDefs();
    } catch (err) {
      if (err.message.includes('no such file or directory')) {
        await fs.mkdirSync('~/Documents/octoFarm', { recursive: true })
        await fs.writeFileSync('~/Documents/octoFarm/printerDefs.json', JSON.stringify([{
          printerIp,
          printerApiKey
        }]), { ecoding: 'utf-8' })
        loadPrinterDefs();

      } else {
        console.error("Something went wrong... Maybe this application doesn't have read/write access to your filesystem? Try running as administrator")
      }
    }
  }

  const updatePrinter = async (index, printer) => {

    const fileData = await fs.readFileSync('~/Documents/octoFarm/printerDefs.json', { encoding: 'utf-8' })
      const printerDefData = JSON.parse(fileData);

      if (printerDefData[index].printerIp === printer.printerIp) {
        printerDefData[index] = printer
        await fs.writeFileSync('~/Documents/octoFarm/printerDefs.json', JSON.stringify(printerDefData));
        loadPrinterDefs();
      } else {
        //TODO : write logic to fail over to searching by IP in the array
        console.error('This is broke')
      }

  }

  let printerCards = null;

  if (printerDefs) {
    console.log(printerDefs)
    printerCards = printerDefs.map((printer, index) => {

      return (
        <PrinterCard printerModel={printer} index={index} updatePrinter={updatePrinter}/>
      )
    })
  }

  return (
    <div className="App">
      <button onClick={async () => await selectFile()}>Select File</button>
      <label>Run print immediately</label>
      <input checked={printImmediately} onChange={e => setPrintImmediately(e.target.checked)} type='checkbox'/>
      {fileInfoState.fileName ?? <p>{fileInfoState.fileName}</p>}
      <button onClick={async () => await uploadFile()}>Upload File</button>

      <label>Printer IP</label>
      <input value={printerIp} onChange={(e) => setPrinterIp(e.target.value)}></input>

      <label>OctoPrint API Key</label>
      <input value={printerApiKey} onChange={(e) => setPrinterApiKey(e.target.value)}></input>

      <button onClick={addPrinter}>Add Printer</button>
      {printerCards}
    </div>
  );
}

export default App;
