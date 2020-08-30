import React,{Component} from 'react'
import queryString from 'query-string'
import Cookies from 'js-cookie'
import * as API from './Utils/APICalls'

const getAccessToken = () => Cookies.get('access_token')
// const isAuthenticated = () => {
//     const temp = getAccessToken()
//     if(temp === undefined) return false
//     else return true
// }

const setTokens = () => {
    const tokens = queryString.parse(window.location.search)
    if(Object.keys(tokens).length ===0){
        return false
    }
    else{
        console.log(tokens.access_token)
        const expires = (tokens.expires_in || 60*60 ) * 1000
        const oneHour = new Date(new Date().getTime() + expires)

        Cookies.set('access_token',tokens.access_token, {expires : oneHour})
        return true
    }
}


const authenticate = async () => {
    // console.log("k")
    if(getAccessToken()){
        console.log('its done here')
      return true
    }
    return false
  }

class Auth extends Component{
    constructor(){
        super()
        this.state ={
            isAuthenticated :false
        }
    }

    componentDidMount(){
        authenticate()
            .then(isAuthenticated => {
                this.setState(() => ({
                    isAuthenticated
                }))
            })
    }

    componentDidUpdate(){
        API.getLatestPosts()
            .then(data =>console.log(data))
    }

    render(){
        console.log(this.state.isAuthenticated)
        if(this.state.isAuthenticated){
            return (
                <div>
                    <h1>Okay you are authenticated friend</h1>
                </div>
            )
        } 
        else{
            return(
                <div>
                    <h1> Restricted page </h1>
                </div>
            )
        }
    }
}


export const AuthenticatedRoute = () => {
    // if(isAuthenticated() || setTokens()){
        if(setTokens()){
        return(
            <Auth />
        )
    }
    else{
        console.log('else block called here')
        return(
            <div>
                <h1> You are not authenticated </h1>
            </div>
        )
    }
}

