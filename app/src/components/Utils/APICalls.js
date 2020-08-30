
import fetch from 'node-fetch'
import Cookies from 'js-cookie'
require('dotenv').config()

var url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/getposts'
export const getLatestPosts = () => {
    var access_token = Cookies.get('access_token') 
    return fetch(url,{
        method: 'GET',
        headers: {
            access_token: access_token
        }
    })
    .then(response => response.json())
    .catch(err =>console.log(err))
}
