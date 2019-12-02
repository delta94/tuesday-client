import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import underscore from 'underscore'

import Collapsible from './partial/Collapsible.js'

import NotInterestedRoundedIcon from '@material-ui/icons/NotInterestedRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import AddCircleRoundedIcon from '@material-ui/icons/AddCircleRounded';
import MailOutlineRoundedIcon from '@material-ui/icons/MailOutlineRounded';

import _ from 'underscore'

const ControlStyle = styled.div`
      background-color: white !important;
      border-top-left-radius: 20px;
      width: 255px;
      height: 100vh;
      padding: 1.2em;
`;

let URL = (model, id = '') => {
    return `https://tuesday-server.herokuapp.com/${model}/${id}`
};

class Control extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memberships: null,
            openNewForm: false
        };

        this.saveProject = this.saveProject.bind(this);
        this.newForm = this.newForm.bind(this);

        if (props.user) {
            this.state.user_id = props.user.id;
            this.state.email = props.user.email;
        }

        const fetchMemberships = () => {
          axios.get(URL(`users`,`${ this.state.user_id }`)).then( ( results ) => {
            const memberships = results.data.memberships;
            this.setState({
              memberships: memberships,
            });
            setTimeout( fetchMemberships, 10000);
          });
        }
        fetchMemberships();
      }

saveProject(content) {
  axios.post(URL(`projects.json`), content).then((result) => {
    debugger;
    console.log(result.data.memberships[0]);
    this.setState({memberships: [...this.state.memberships, result.data.memberships[0]]})
    })
}

    newForm(){
        this.setState({
            openNewForm: !this.state.openNewForm
        })
    }

    render() {
        let renderForm;
        this.state.openNewForm ? renderForm=<NewProjectForm onSubmit={ this.saveProject } newForm={this.newForm}/> : renderForm=null;

        if ( this.state.memberships === null ) {
            return (<>
                </>);
            }
            return (
                <ControlStyle>
                <SmallTitle><MailOutlineRoundedIcon /> <span style={{marginLeft: "1em"}}>Inbox</span></SmallTitle>
                <div style={{minHeight: '18vh', borderBottom:'1px solid #F1F1F1'}}>
                <Collapsible title={`Pending invites (${_.where(this.state.memberships, {invitation: false}).length})`} function="invitation" >
                <Memberships memberships={ this.state.memberships } />
                </Collapsible>
                </div>

                <div>
                <Title><span>Projects</span><span onClick={this.newForm}  ><AddCircleRoundedIcon style={{color: '#009AFF', fontSize:'30px'}} /></span></Title>
                <Projects memberships={ this.state.memberships } onClick={ this.props.onClick }/>

                </div>
                {renderForm}
                </ControlStyle>
            )
        }
    }

    const SmallTitle = styled.h1`
        fond-family: "Abel";
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
    `;


    function Memberships(props) {
        return (
            <MembershipWrap>
            {props.memberships.map(m => m.invitation === false ? <Invitation membership={ m }/> : null)}
            </MembershipWrap>
        );
    }

    const MembershipWrap = styled.div`
    `;

    class Invitation extends Component {
        constructor(props) {
            super(props);
            this.state = {
                membership_id: this.props.membership.id,
            };

            this._acceptInvite = this._acceptInvite.bind(this);
            this._declineInvite = this._declineInvite.bind(this);
        }

        _acceptInvite() {
            axios.put(URL(`memberships`,`${ this.state.membership_id }.json`), {invitation : true}).then(result => console.log('Successfully updated.'))
        }

        _declineInvite() {
            axios.delete(URL(`memberships`, `${ this.state.membership_id }.json`)).then( result => console.log('Successfully deleted.'))
        }

        render() {
            return (
                <InvitationWrap>
                <Wrap>
                <AccountTreeOutlinedIcon /><span style={{width: '130px', overflowX:'scroll'}}>{ this.props.membership.project.name }</span>
                </Wrap>
                <div>
                <Button onClick={ this._acceptInvite }><CheckCircleOutlineRoundedIcon /></Button>
                <Button onClick={ this._declineInvite }><NotInterestedRoundedIcon /></Button>
                </div>
                </InvitationWrap>
            )
        }
    }

    const Title = styled.h1`
        fond-family: "Abel";
        font-size: 1.5rem;
        font-weight: 800;
        display: flex;
        justify-content: space-between;

    `;

    const InvitationWrap = styled.div`
        display: flex;
        justify-content: space-between;
        color: rgba(95, 108, 113, 0.5);
        padding: 4px;
        margin-top: 3px;
        border-radius: 5px;
        align-item: center;
        height: 30px;
        font-family: "Abel";
        overflow: scroll;
        overflow-x: hidden;

        &:hover {
            background-color: rgba(95, 108, 113, 0.1);
            color: #333333;

        }
    `;

    const Wrap = styled.div`
        display: flex;
        align-item: center;
    `;


    const Button = styled.button`
        border: none;
        background-color: transparent;
        color: rgba(95, 108, 113, 0.5);

        &:hover{
            color: #0086C0;
            cursor: pointer;

        }
    `;

    function Projects(props) {
        return (
            <div>
            {props.memberships.map( (p) => {
                if ( p.invitation === true ) {
                    return (
                        <div>
                          <button style={{color: '#009AFF', fontWeight: 'bold', fontSize: '17px', marginTop: '0.5em'}} onClick={() => { props.onClick(p.project.id);
                           }}>{ p.project.name }</button>
                        </div>
                    )
                }
            })}
            </div>
        )
    }

    class NewProjectForm extends Component {
        constructor(props) {
            super(props);
            this.state = {
                name: '',
                description: ''
            }
            this._handleInput = this._handleInput.bind(this);
            this._handleSubmit = this._handleSubmit.bind(this);
        }

        _handleInput(event) {
            const { name, value } = event.target
            this.setState({ [name]: value })
        }

        _handleSubmit(event) {
            event.preventDefault();
            this.props.onSubmit(this.state);
            this.setState({
                name: '',
                description: ''
            })
            this.props.newForm()
        }


        render() {
            return (
                <StyledForm onSubmit={ this._handleSubmit }>
                <h2 style={{margin: '0 0 1em 0' }}>Create Project</h2>
                <div>
                <Input
                type="text"
                name="name"
                placeholder ="Project Name"
                required
                value={ this.state.name }
                onInput={ this._handleInput }
                />
                <TextField
                type="text"
                name="description"
                placeholder ="Project Description"
                value={ this.state.description }
                onInput={ this._handleInput }
                />
                </div>
                <div style={{margin: '2em 0 0 12em' }}>
                <BackLink onClick={this.props.newForm}> Cancel </BackLink>
                <SubmitFormButton type="submit" name="Submit" >Create</SubmitFormButton>
                </div>
                </StyledForm>
            )
        }
    }

    const StyledForm = styled.form`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30%;
        background-color: white;
        border: 1px solid rgb(204, 204, 204);
        overflow: hidden auto;
        border-radius: 4px;
        outline: none;
        padding: 32px;
        transition: all 0.3s ease 0s;
        will-change: width;
        max-width: 1020px;
        width: 500px;
        font-family: Abel;

        z-index: 9;
        `;

    const SubmitFormButton = styled.button`
        display: inline-block;
        font-family: Abel;
        text-align: center;
        cursor: pointer;
        border: 1px solid transparent;
        padding: .6rem 2rem;
        font-size: 1.3rem;
        border-radius: 15rem;
        background-color: rgb(0, 154, 255);
        color: white;

        &:hover {
            background-color: #0086C0;
        }
    `;

    const BackLink = styled.span`
        display: inline-block;
        font-family: Abel;
        cursor: pointer;
        padding: .6rem 2rem;
        font-size: 1.3rem;
        color: rgb(0, 154, 255);

        &:hover {
            color: #0086C0;
        }
    `;

    const Input = styled.input`
        border: 1px solid lightgrey;
        background-color: white;
        width: 430px;
        height:50px;
        margin: 0;
        padding: 6px 12px;
        color: black;
        font-size: 1em;
        font-family: "Abel";

        &:focus {
        border: 1px solid #0086C0;
        }
        `;

        const TextField = styled.textarea`
            border: 1px solid lightgrey;
            background-color: white;
            width: 430px;
            height:150px;
            margin: 0;
            padding: 6px 12px;
            color: black;
            font-size:1em;
            font-family: "Abel";

            &:focus {
            border: 1px solid #0086C0;
            }
            `;
export default Control;
