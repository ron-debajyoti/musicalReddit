import React,{Component} from 'react'
import {Link ,Route, Switch} from 'react-router-dom'
import styled from 'styled-components/macro'
import {AuthenticatedRoute} from './Auth'

const Title = styled.h1`
    font-size: 1.5em;
    margin: 0px 0px 10px;
    float: center;
`

const Wrapper = styled.main`
    height: 100%;
    min-height: 100vh;
    box-sizing: inherit;
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #ff5800;
`

const Button = styled.button`
    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    background-color: purple;
    color: black;
    text-align : center;
    border: 2px solid black;
    border-radius: 20px;
`
var url =  process.env.REACT_APP_AUTH_URL || 'http://localhost:4000/login'

class Login extends Component{

    mainPage = () => {
        return(
            <Wrapper>
                <Title>
                    Musical Reddit
                </Title>
                <Link to='/'>
                    <Button onClick={() => {window.location.href = url}}>
                        Log in using Reddit
                    </Button>
                </Link>
            </Wrapper>
        )
    }

    render(){
        return(
            <Route>
                <Switch>
                    <Route exact path='/' component={this.mainPage} />
                    <Route path='/main' render={() => AuthenticatedRoute()} />
                </Switch>
            </Route>
        )
    }

}

export default Login