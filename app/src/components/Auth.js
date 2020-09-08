import React,{Component} from 'react'
import queryString from 'query-string'
import Cookies from 'js-cookie'
import * as API from './Utils/APICalls'
import Background from './Background'
import styled from 'styled-components/macro'
import '../css/Auth.css'

const Wrapper = styled.div`
    background-color: #fca000;
    width: 100%;
    position: relative;
`
const Footer = styled.a`
    font-size : 1em;
`

var globalData = []
const EXPIRATION = 3600*1000


const setTimestamp = () => {
    window.localStorage.setItem('token_timestamp',Date.now())
}
const getAccessToken = () => Cookies.get('access_token')
const getRefreshToken = () => Cookies.get('refresh_token')
const getTimestamp = () => window.localStorage.getItem('token_timestamp')

const isAuthenticated = () => {
    var temp = getAccessToken()
    if(temp === undefined || (Date.now()-getTimestamp())>EXPIRATION ){
        console.log('this is called')
       temp = getRefreshToken()
       if(temp === undefined){
           return false
       } else{
        return refreshAccessToken(temp)
       }
    }
    else return true
}

const setTokens = () => {
    const tokens = queryString.parse(window.location.search)
    if(Object.keys(tokens).length ===0){
        return false
    }
    else{
        // const expires = (tokens.expires_in || 60*60 ) * 1000
        // const oneHour = new Date(new Date().getTime() + expires)
        setTimestamp()
        Cookies.set('access_token',tokens.access_token)
        Cookies.set('refresh_token',tokens.refresh_token)
        return true
    }
}

const refreshAccessToken = async (refresh_token) =>{
    try{
        var access_token = await API.getNewAccessToken(refresh_token)
        console.log(access_token)
        setTimestamp()
        Cookies.set('access_token',access_token)
        return true
    } catch(e){
        console.error(e)
    }
}


const authenticate = async () => {
    // console.log("k")
    if(getAccessToken() !== undefined){
        console.log('its done here')
      return true
    }
    return false
  }

class Auth extends Component{
    constructor(){
        super()
        this.state ={
            isAuthenticated :false,
            data:null
        }
    }

    mergeData = (data) => {
        var temp = []
        data.forEach(item => {
            temp = temp.concat(item.data)
        })
        temp.sort((a,b) => parseInt(a.created_utc) - parseInt(b.created_utc))
        return temp.slice(50,250)

    }

    componentDidMount(){
        authenticate()
            .then(isAuthenticated => {
                this.setState(() => ({
                    ...this.state,
                    isAuthenticated : isAuthenticated
                }))
            })
            .then(() => API.getLatestPosts(getAccessToken()))  
            .then(data => {
                globalData = this.mergeData(data)
                return globalData
            })
            // .then(data => console.log(data))
            .then(data =>{
                console.log(data)
                this.setState(() => ({
                    ...this.state,
                    data : data
                }))
            })
    }

    componentDidUpdate(prevProp, prevState){
    }

    render(){
        if(this.state.isAuthenticated){
            if(this.state.data !== null){
                return (
                    <Wrapper id='parent'>
                        <h1>Welcome</h1>
                        <Background data={this.state.data}/>
                        <Footer href='https://github.com/ron-debajyoti/musicalReddit' target="_blank">
                            Github
                        </Footer>
                    </Wrapper>
                )
            }
            else{
                return(
                    <Wrapper>
                        <h1> Data loading... Please wait.... </h1>
                    </Wrapper>
                )
            }
            
        } 
        else{
            return(
                <Wrapper>
                    <h1> Restricted page </h1>
                </Wrapper>
            )
        }
    }
}


export const AuthenticatedRoute = () => {
    var temp1 = isAuthenticated()
    var temp2 = setTokens()
    if(temp1 || temp2){
        // if(setTokens()){
        return(
            <Auth />
        )
    }
    else{
        console.log('else block called here')
        return(
            <div>
                <h1> You are not authenticated to visit this page </h1>
            </div>
        )
    }
}

