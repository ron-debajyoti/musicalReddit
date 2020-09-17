import React,{ Component} from 'react'
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
const About = styled.div`
    font-size : 1em;
    height: 25%;
    position: relative;
`

var globalData = []
var asyncIntervals = []
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

    runAsyncFetchData = async (f,interval,index) => {
        await f()
        if(asyncIntervals[index]){
            setTimeout(() => this.runAsyncFetchData(f,interval,index), interval)
        }
    }

    setAsyncInterval = async (f,interval) => {
        if(f && typeof f=== "function"){
            const index = asyncIntervals.length
            asyncIntervals.push(true)
            this.runAsyncFetchData(f,interval,index)
            return index
        } else{
            throw new Error('Callback must be a function')
        }
    }

    clearAsyncInterval = (index) => {
        if(asyncIntervals[index]){
            asyncIntervals[index] = false
        }
    }

    fetchData = async () => API.getLatestPosts(getAccessToken())
                                .then(data => {
                                    // console.log('reacted done here')
                                    // if(data !== this.state.data){
                                    //     console.log('unmatched')
                                    // }
                                    return data
                                })
                                .then((data) => {
                                    //console.log("called!")
                                    globalData = this.mergeData(data)
                                    return globalData
                                })
                                .then(data =>{
                                    //console.log(data)
                                    this.setState(() => ({
                                        ...this.state,
                                        data : data
                                    }))
                                })

    
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
            .then(() => this.setAsyncInterval(this.fetchData,90000))  
            // .then(data => console.log(data))
    }

    componentDidUpdate(prevProp, prevState){
    }

    render(){
        if(this.state.isAuthenticated){
            if(this.state.data !== null){
                return (
                    <Wrapper id='parent'>
                        <h1 styles={{'color':'white'}}>Musical Reddit from subreddits</h1>
                        <Background data={this.state.data} />
                        <About>
                            <h2> About </h2>
                            <span> This project tracks latest posts made on selected subreddits made across Reddit and 
                                converts them into music notes based on parameters and types of sounds used.
                            </span>
                            <br></br>
                            <br></br>
                            <Footer href='https://github.com/ron-debajyoti/musicalReddit' target="_blank">
                                Github
                            </Footer>
                        </About>
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

