
import fetch from 'node-fetch'
require('dotenv').config()

var url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/getposts'
export const getLatestPosts = (access_token) => {
        return fetch(url,{
            method: 'GET',
            headers: {
                access_token: access_token
            }
        })
        .then(response => response.json())
        .catch(err =>console.error(err))
}

export const getNewAccessToken = (refresh_token) => {
    return fetch(url,{
        method:'GET',
        headers:{
            refresh_token: refresh_token
        }
    })
    .catch(err => console.error(err))
}

