const request = require('request-promise').defaults({ encoding: null })
const fs = require('fs')
const express = require('express')
const qs = require('qs')
const app = express()
const port = 5000

app.get('/', async (req, res) => {
  let query = req.query
  let path, unlimited
  if (query.path) {
    path = query.path
    delete query.path
  }
  if (query.unlimited) {
    unlimited = query.unlimited == 1
    delete query.unlimited
  }
  let data = await getQrcode(req.query, path, unlimited)
  res.end(data)
})
app.listen(port, () => console.log(`App listening on port ${port}!`))

const url = {
  getAccessToken: 'https://api.weixin.qq.com/cgi-bin/token',
  getWxacodeLimited: 'https://api.weixin.qq.com/wxa/getwxacode',
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

async function getQrcode (params, path = '', unlimited = false) {
  let data = await request(url.getAccessToken + '?' + qs.stringify({ grant_type: 'client_credential', appid: config.id, secret: config.secret })).catch(err => console.log(err))
  let access_token = JSON.parse(data).access_token
  let uri, body
  console.log('unlimited', unlimited)
  if (unlimited) {
    uri = url.getWxacodeUnlimited
    body = { scene: qs.stringify(params) }
  } else {
    uri = url.getWxacodeLimited
    body = { path: `${path}?${qs.stringify(params)}` }
  }
  console.log(body)
  data = await request({
    uri: uri + `?access_token=${access_token}`,
    method: 'POST',
    body,
    json: true
  })
  /*
  fs.writeFile('qrcode', data, err => {
    console.log(err)
  })
  */
  console.log(data)
  return data
}
