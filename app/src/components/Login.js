import React,{Component} from 'react'
import {Link ,Route, Switch} from 'react-router-dom'
import styled from 'styled-components/macro'
import {AuthenticatedRoute} from './Auth'


const Button = styled.button`
    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    background-color: red;
    color: black;
    text-align : center;
    border: 2px solid black;
    border-radius: 20px;
`

class Login extends Component{

    mainPage = () => {
        return(
            <div>
                <h1>
                    Musical Reddit
                </h1>
                <Link to='/'>
                    <Button onClick={() => {window.location.href = process.env.REACT_APP_AUTH_URL}}>
                        Log in using Reddit
                    </Button>
                </Link>
            </div>
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