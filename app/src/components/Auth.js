import React,{Component} from 'react'
import queryString from 'query-string'
import Cookies from 'js-cookie'
import * as API from './Utils/APICalls'
import Background from './Background'
import styled from 'styled-components/macro'
import '../css/Auth.css'

const Wrapper = styled.div`
    height:100%;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
`



var globalData = []
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
        return temp.slice(125,250)

    }

    componentDidMount(){
        authenticate()
            .then(isAuthenticated => {
                this.setState(() => ({
                    ...this.state,
                    isAuthenticated : isAuthenticated
                }))
            })
        API.getLatestPosts()
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
        console.log(this.state.isAuthenticated)
        if(this.state.isAuthenticated){
            if(this.state.data !== null){
                return (
                    <Wrapper id='parent'>
                        <h1>Welcome</h1>
                        <Background data={this.state.data}/>
                    </Wrapper>
                )
            }
            else{
                console.log(this.state)
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
                <h1> You are not authenticated to visit this page </h1>
            </div>
        )
    }
}

