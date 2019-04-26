import React, { Component } from 'react'
import sharedb from 'sharedb/lib/client'
import { w3cwebsocket as W3CWebSocket  } from 'websocket'
import StringBinding from 'sharedb-string-binding'

export default class TextArea extends Component {
    constructor(props){
        super(props)
        this.state = {
            clicks: 0
        }
        var socket = new W3CWebSocket('ws://localhost:8080')
        var connection = new sharedb.Connection(socket)
        this.document = connection.get('examples', 'textarea');

        this.updateText = this.updateText.bind(this)

        this.document.subscribe(this.updateText)
    }

    updateText(err){
        if (err) throw err;

        var textarea = document.querySelector('#collab-editor');

        var binding = new StringBinding(textarea, this.document, ['content']);
        binding.setup();
    }

    render(){
        return (
            <div>
                <textarea name="collab-editor" id="collab-editor" cols="30" rows="10"></textarea>
            </div>
        )
    }
}