import { ChangeEventHandler } from 'react'
import SparkMD5 from 'spark-md5'
function App() {
  const CHUNK_SIZE = 1024 * 1024
  let fileHash = '',
    fileName = ''

  const createChunks = (file: File) => {
    let cur = 0
    const chunks = []

    while (cur < file.size) {
      const blob = file.slice(cur, cur + CHUNK_SIZE)
      chunks.push(blob)
      cur += CHUNK_SIZE
    }

    return chunks
  }
  const calculateHash = (chunks: Blob[]) => {
    return new Promise((resolve) => {
      const target: Blob[] = []
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()

      chunks.forEach((chunk, index) => {
        if (index === 0 || index === chunks.length - 1) {
          target.push(chunk)
        } else {
          target.push(chunk.slice(0, 2))
          target.push(chunk.slice(chunks.length / 2, chunks.length / 2 + 2))
          target.push(chunk.slice(chunks.length - 2, chunks.length))
        }
      })
      fileReader.readAsArrayBuffer(new Blob(target))
      fileReader.onload = (e) => {
        spark.append(e.target.result)
        resolve(spark.end())
      }
    })
  }

  const mergeRequest = () => {
    fetch('http://127.0.0.1:3000/merge', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        fileHash: fileHash,
        fileName: fileName,
        size: CHUNK_SIZE
      })
    }).then(() => {
      alert('合并成功')
    })
  }
  const verigy = async () => {
    return fetch('http://127.0.0.1:3000/verigy', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        fileHash: fileHash,
        fileName: fileName,
        size: CHUNK_SIZE
      })
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => data)
  }
  const uploadChunks = async (chunks: Blob[], existChunks: string[]) => {
    console.log(chunks)
    const data = chunks.map((chunk, index) => {
      return {
        fileHash,
        chunkHash: fileHash + '-' + index,
        chunk
      }
    })
    const formDatas = data
      .filter((item) => !existChunks.includes(item.chunkHash))
      .map((item) => {
        const formData = new FormData()
        formData.append('fileHash', item.fileHash)
        formData.append('chunkHash', item.chunkHash)
        formData.append('chunk', item.chunk)
        return formData
      })

    const max = 0
    let index = 0
    const taskPool = []

    while (index < formDatas.length) {
      const task = fetch('http://127.0.0.1:3000/upload', {
        method: 'POST',
        body: formDatas[index]
      })
      taskPool.splice(taskPool.findIndex((item) => item === task))
      taskPool.push(task)
      if (taskPool.length === max) {
        await Promise.race(taskPool)
      }
      index++
    }
    await Promise.all(taskPool)
    await mergeRequest()
  }
  const handleLoad: ChangeEventHandler<HTMLInputElement> = async (e) => {
    //读取文件
    const files = e.target.files
    if (!files) return
    // setFileName(files[0].name)
    fileName = files[0].name
    //切片
    const chunks = createChunks(files[0])

    // 计算哈希值
    const hash = await calculateHash(chunks)
    fileHash = hash as string
    // setFileHash(hash as string)
    const data = await verigy()
    console.log(data, 'ooo')
    if (!data.data.shouldUpload) {
      alert('妙传')
      return
    }
    uploadChunks(chunks, data.data.existChunks)
  }
  return (
    <>
      <h1>大文件上传</h1>
      <input onChange={handleLoad} type="file" />
    </>
  )
}

export default App
