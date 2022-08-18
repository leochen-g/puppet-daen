const axios = require('axios')
const {FileBox} = require('file-box')
const {URL} = require('url')

// async function putFileTransfer (fileName, fileData) {
//   const res = await axios.put(`https://transfer.sh/${fileName}`, fileData)
//   return res.data
// }
// function uploadFile() {
//   const file = FileBox.fromUrl('https://transfer.sh/get/r7DxQk/1.docx')
//   const buffer = file.toBuffer()
//   putFileTransfer(file.name, buffer).then(res=> {
//     console.log('res', res)
//     const parseUrl = new URL(res)
//     const path = parseUrl.origin + '/get' + parseUrl.pathname
//     console.log('path', path)
//   })
// }
//
// uploadFile()

async function getFile() {
  const res = await axios.get(`http://10.10.10.15:8055/DaenWxHook/client/view/?name=37fae627e4cea0a2989a4a63028feeb8.png`, {headers: {
      'Content-Type': 'application/json'
    }})
  console.log(res)
  FileBox.fromUrl('http://10.10.10.15:8055/DaenWxHook/client/view/?name=37fae627e4cea0a2989a4a63028feeb8.png').toFile('./37fae627e4cea0a2989a4a63028feeb8.png')
}

getFile()
