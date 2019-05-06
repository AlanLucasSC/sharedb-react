import React, {Component} from 'react';

import 'react-chat-widget/lib/styles.css';
import { Widget, addResponseMessage } from 'react-chat-widget';

import socket from '../../utils/socket';

import userLogo from '../../user.svg';

class ChatWidget extends Component{
    constructor(props){
        super(props)
        this.state={
            title : 'Bem vindo',
            subtitle : '',
        }
        
        this.handleNewResponse = this.handleNewResponse.bind(this);
        this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
        
        socket.on('user Message', this.handleNewResponse);
    }
    
    handleNewUserMessage = (newMessage) =>{
        socket.emit('msg', newMessage, this.props.id);
    }
    
    handleNewResponse = (message) =>{
        addResponseMessage(message);
    }

    render(){
        return(
            <Widget 
                title = { this.state.title }
                subtitle = { this.state.subtitle }
                profileAvatar = { userLogo }
                handleNewUserMessage={ this.handleNewUserMessage }
            />
        )
    }
}
export default ChatWidget;