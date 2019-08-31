const request = require('request-promise').defaults({ encoding: null })
const fs = require('fs')
const express = require('express')
const qs = require('qs')
const app = express()
const port = 5000

app.get('/', async (req, res) => {
  let data = await getQrcode({ scene: qs.stringify(req.query) })
  res.end(data)
})
app.listen(port, () => console.log(`App listening on port ${port}!`))

const url = {
  getAccessToken: 'https://api.weixin.qq.com/cgi-bin/token',
  getWxacodeUnlimited: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit'
}
const name = 'parent'
/*
 config.js 格式
 [
   {
     name: '小程序名，商量定义好'
     id: '小程序appId'
     secret: '小程序appSecret'
   }
 ]
*/
const config = require('./config').find(_ => _.name = name)

async function getQrcode (params) {
  let data = await request(url.getAccessToken + '?' + qs.stringify({ grant_type: 'client_credential', appid: config.id, secret: config.secret })).catch(err => console.log(err))
  let access_token = JSON.parse(data).access_token
  data = await request({
    uri: url.getWxacodeUnlimited + `?access_token=${access_token}`,
    method: 'POST',
    body: params,
    json: true
  })
  /*
  fs.writeFile('qrcode', data, err => {
    console.log(err)
  })
  */
  return data
}
