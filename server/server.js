require('dotenv').config()
const snoowrap = require('snoowrap')
const express = require('express')
let request = require('request')
const querystring = require('querystring')

var app = express()
app.set('json spaces',2)
let port = process.env.PORT || 4000
let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:4000/callback'
// console.log(process.env.REDDIT_CLIENT)

app.get('/login',(req,res) => {
    res.redirect('https://www.reddit.com/api/v1/authorize?'+
    querystring.stringify({
        response_type: 'code',
        client_id: process.env.REDDIT_CLIENT,
        state: 'sddsfnjdskg',
        scope: 'identity wikiread',
        redirect_uri
    }))
})


app.get('/callback', (req,res) => {
    let code = req.query.code || null
    let authOptions = {
        url : 'https://www.reddit.com/api/v1/access_token',
        form: {
            code: code,
            redirect_uri,
            grant_type: 'authorization_code'
        },
        headers : {
            'Authorization': 'Basic '+(new Buffer(process.env.REDDIT_CLIENT + ':' + 
                process.env.REDDIT_SECRET).toString('base64'))
        },
        json: true
    }

    request.post(authOptions, (error, response,body) => {
        if(!error){
            console.log("working till here ")
            var access_token = body.access_token
            var refresh_token = body.refresh_token
            let frontend_uri = process.env.FRONTEND_URI || 'http://localhost:3000/'
            res.redirect(frontend_uri +'?' + querystring.stringify({
                access_token:access_token,
                refresh_token: refresh_token
            }))
        }
        else{
            throw error
        }
    })
})

console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)


