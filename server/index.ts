const express = require('express')
const path = require('path')
const multiparty = require('multiparty')
const fse = require('fs-extra')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(cors())

//提取文件名
const extractExt = (fileName: string) => {
  return fileName.slice(fileName.lastIndexOf('.'), fileName.length)
}

const UPLOAD_DIR = path.resolve(__dirname, 'uploads')

app.post('/upload', (req: any, res: any) => {
  const form = new multiparty.Form()

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      res.status(401).json({
        ok: false,
        msg: '失败'
      })
      return
    }

    const fileHash = fields['fileHash'][0]
    const chunkHash = fields['chunkHash'][0]

    //临时存放目录
    const chunkPath = path.resolve(UPLOAD_DIR, fileHash)

    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }

    const oldPath = files['chunk'][0].path
    fse.move(oldPath, path.resolve(chunkPath, chunkHash))

    res.status(200).json({
      ok: true,
      msg: '成功'
    })
  })
})

app.post('/merge', async (req: any, res: any) => {
  const { fileHash, fileName, size } = req.body
  console.log(fileHash)
  console.log(fileName)
  console.log(size)

  const filePath = path.resolve(UPLOAD_DIR, fileHash + extractExt(fileName))
  if (fse.existsSync(filePath)) {
    res.status(200).json({
      ok: true,
      msg: '成功'
    })
    return
  }

  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  if (!fse.existsSync(chunkDir)) {
    res.status(401).json({
      ok: true,
      msg: '合并失败'
    })
    return
  }

  const chunkPaths = await fse.readdir(chunkDir)
  console.log(chunkPaths)
  chunkPaths.sort((a: string, b: string) => {
    return Number(a.split('-')[1]) - Number(b.split('-')[1])
  })

  const list = chunkPaths.map((chunkName: string, index: number) => {
    return new Promise((resolve) => {
      const chunkPath = path.resolve(chunkDir, chunkName)
      const readStream = fse.createReadStream(chunkPath)
      const writeStream = fse.createWriteStream(filePath, {
        start: index * size,
        end: (index + 1) * size
      })
      readStream.on('end', async () => {
        await fse.unlink(chunkPath)
        resolve(1)
      })
      readStream.pipe(writeStream)
    })
  })
  await Promise.all(list)

  await fse.remove(chunkDir)

  res.status(200).json({
    ok: true,
    msg: '成功'
  })
})

app.post('/verigy', async (req: any, res: any) => {
  const { fileHash, fileName } = req.body
  console.log(fileHash, fileName, '8888')
  const filePath = path.resolve(UPLOAD_DIR, fileHash + extractExt(fileName))

  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  console.log('chunkDir', chunkDir)

  let chunkPaths = []
  if (fse.existsSync(chunkDir)) {
    chunkPaths = await fse.readdir(chunkDir)
  }

  if (fse.existsSync(filePath)) {
    res.status(200).json({
      ok: true,
      data: {
        shouldUpload: false
      }
    })
  } else {
    res.status(200).json({
      ok: true,
      data: {
        shouldUpload: true,
        existChunks: chunkPaths
      }
    })
  }
})

app.listen(3000, () => {
  console.log('server running.....')
})
