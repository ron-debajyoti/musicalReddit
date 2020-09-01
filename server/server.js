require('dotenv').config()
const snoowrap = require('snoowrap')
const express = require('express')
var request = require('request')
var cors = require('cors')
const querystring = require('querystring')


var app = express()
app.use(cors())
app.set('json spaces',2)
let port = process.env.PORT || 4000
// let mongodbAddress = process.env.MONGODB_ADDRESS || 'mongodb://localhost:27017'
let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:4000/callback'
// console.log(process.env.REDDIT_CLIENT)


const stripData = (data,subreddit) => {
    var store = []
    data.forEach(dataElement => {
        var storeObject = {}
        storeObject['created_utc'] = dataElement.created_utc
        storeObject['authorName'] = dataElement.author.name
        storeObject['authorFullName'] = dataElement.author_fullname
        storeObject['id'] = dataElement.id
        storeObject['permalink'] = dataElement.permalink
        storeObject['title'] = dataElement.title
        storeObject['subreddit'] = subreddit
        store.push(storeObject)
    })
    return store

}

//Login route
app.get('/login',(req,res) => {
    res.redirect('https://www.reddit.com/api/v1/authorize?'+
    querystring.stringify({
        response_type: 'code',
        client_id: process.env.REDDIT_CLIENT,
        state: 'sddsfnjdskg',
        scope: 'read',
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
            // console.log(body)
            var access_token = body.access_token
            let frontend_uri = process.env.FRONTEND_URI || 'http://localhost:3000/'
            res.redirect(frontend_uri +'?' + querystring.stringify({
                access_token:access_token
            }))
        }
        else{
            throw error
        }
    })
})


// a REST API interface that returns the posts 
app.get('/getposts',(req,res) => {
    let access_token = req.headers.access_token
    var subreddits = ['ContagiousLaughter','funny','AskReddit','gaming','aww','pics','Music','tifu','worldnews','videos']
    const r = new snoowrap({
        accessToken: access_token,
        userAgent: process.env.USER_AGENT
    })

    let promiseArr = subreddits.map(item => {
        return r.getSubreddit(item).getNew()
            .then(data => stripData(data,item))
            .then(data => {
                return {
                    'subreddit':item,
                    'data': data
                }
            })
    })
    
    Promise.all(promiseArr)
        .then(data => res.send(data))
    
})

console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)


